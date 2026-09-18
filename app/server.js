'use strict';
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const M = require('./engine/malrules');
const F = require('./engine/fluency');
const intake = require('./engine/intake');
const pip = require('./engine/pip');
const judge = require('./engine/judge');
const llm = require('./engine/llm');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

const sessions = new Map();
const MAX_TURNS = 4;

function newSession(learner, diagnosis) {
  const id = crypto.randomBytes(6).toString('hex');
  const today = new Date();
  const queue = diagnosis.problems
    .filter(x => x.status === 'verified')
    .map(x => ({ malrule: x.malrule, name: x.name, source: x.problem, written: x.written_answer, correct: x.correct, firstWrong: today.toISOString(), status: 'open', drill: null, teach: null }));
  const s = { id, learner: learner || 'Maya', createdAt: today.toISOString(), diagnosis, queue, history: seedHistory(today) };
  sessions.set(id, s);
  return s;
}

// Prior cleared misconceptions so the parent view and tutor brief show a trajectory.
function seedHistory(today) {
  const d = n => new Date(today.getTime() - n * 864e5).toISOString().slice(0, 10);
  return [
    { malrule: 'frac_bigger_denom_bigger', name: M.byId.frac_bigger_denom_bigger.name, firstWrong: d(31), cleared: d(24), quality: 3, verdict: 'fluent' },
    { malrule: 'frac_sub_across', name: M.byId.frac_sub_across.name, firstWrong: d(19), cleared: d(11), quality: 2, verdict: 'hesitant' },
  ];
}

function getSession(req, res) {
  const s = sessions.get(req.params.id);
  if (!s) { res.status(404).json({ error: 'no such session' }); return null; }
  return s;
}

app.get('/api/health', (req, res) => res.json({ mode: llm.live() ? 'live' : 'mock', model: llm.MODEL, malrules: M.MALRULES.map(m => ({ id: m.id, name: m.name })) }));

// ---- intake ----
app.post('/api/intake', upload.single('photo'), async (req, res) => {
  try {
    let diagnosis;
    if (req.file && llm.live()) {
      diagnosis = await intake.diagnose({ imageBase64: req.file.buffer.toString('base64'), mediaType: req.file.mimetype || 'image/jpeg' });
    } else {
      diagnosis = intake.mockDiagnosis();
    }
    const s = newSession(req.body.learner, diagnosis);
    res.json({ sessionId: s.id, learner: s.learner, diagnosis, queue: s.queue });
  } catch (e) {
    console.error('[intake]', e);
    // On-camera safety net: never leave the parent with nothing.
    const s = newSession(req.body.learner, { ...intake.mockDiagnosis(), mode: 'fallback', error: e.message });
    res.json({ sessionId: s.id, learner: s.learner, diagnosis: s.diagnosis, queue: s.queue, fallback: true });
  }
});

// Parent confirms what was actually written for an unverified item.
app.post('/api/session/:id/confirm', (req, res) => {
  const s = getSession(req, res); if (!s) return;
  const { index, written } = req.body;
  const item = s.diagnosis.problems[index];
  if (!item) return res.status(400).json({ error: 'bad index' });
  const p = item.problem;
  const v = intake.verify({ item: { ...item, written_answer: written }, p, cands: M.candidates(p), codeMatch: M.matchWritten(p, written), modelPick: null });
  s.diagnosis.problems[index] = v;
  if (v.status === 'verified' && !s.queue.some(q => q.malrule === v.malrule)) {
    s.queue.push({ malrule: v.malrule, name: v.name, source: p, written, correct: v.correct, firstWrong: new Date().toISOString(), status: 'open', drill: null, teach: null });
  }
  res.json({ item: v, queue: s.queue });
});

app.get('/api/session/:id', (req, res) => { const s = getSession(req, res); if (s) res.json(s); });

// ---- drill: a few fresh problems on the malrule, answered by voice ----
app.post('/api/session/:id/drill/start', (req, res) => {
  const s = getSession(req, res); if (!s) return;
  const q = s.queue[req.body.queueIndex ?? 0]; if (!q) return res.status(400).json({ error: 'no item' });
  const rule = M.byId[q.malrule];
  const r = M.rng(Date.now() & 0xffff);
  const problems = [];
  while (problems.length < 3) {
    const p = rule.generate(r);
    if (JSON.stringify(p) !== JSON.stringify(q.source) && !problems.some(x => JSON.stringify(x.p) === JSON.stringify(p))) {
      problems.push({ p, text: M.problemText(p), correct: M.answerStr(p, M.correctAnswer(p)), trap: M.answerStr(p, rule.execute(p)) });
    }
  }
  q.drill = { problems, results: [] };
  res.json({ rule: { id: rule.id, name: rule.name }, problems: problems.map(x => ({ text: x.text, p: x.p })) });
});

app.post('/api/session/:id/drill/answer', (req, res) => {
  const s = getSession(req, res); if (!s) return;
  const q = s.queue[req.body.queueIndex ?? 0]; if (!q?.drill) return res.status(400).json({ error: 'no drill' });
  const pr = q.drill.problems[req.body.index]; if (!pr) return res.status(400).json({ error: 'bad index' });
  const heard = spokenToAnswer(req.body.spoken || '', pr.p);
  const correct = heard != null && sameAnswer(pr.p, heard, pr.correct);
  const trap = heard != null && sameAnswer(pr.p, heard, pr.trap);
  q.drill.results[req.body.index] = { heard, correct, trap };
  if (q.drill.results.filter(Boolean).length === q.drill.problems.length) q.status = 'drilled';
  res.json({ heard, correct, trap, answer: pr.correct });
});

// ---- teach: the understudy session ----
app.post('/api/session/:id/teach/start', async (req, res) => {
  const s = getSession(req, res); if (!s) return;
  const qi = req.body.queueIndex ?? 0;
  const q = s.queue[qi]; if (!q) return res.status(400).json({ error: 'no item' });
  const rule = M.byId[q.malrule];
  // Same bug, new clothes: a problem the learner has not seen.
  const r = M.rng((Date.now() & 0xffff) + 17);
  let p = rule.generate(r);
  while (JSON.stringify(p) === JSON.stringify(q.source)) p = rule.generate(r);
  const wrong = M.answerStr(p, rule.execute(p));
  q.teach = { p, wrong, correct: M.answerStr(p, M.correctAnswer(p)), history: [], released: false, learnerTurns: 0, gaveUp: false, startedAt: new Date().toISOString() };
  const opening = await pip.turn({ rule, p, history: [], released: false });
  q.teach.history.push({ who: 'pip', text: opening.text });
  res.json({
    rule: { id: rule.id, name: rule.name, kid: rule.kid, rubric: rule.rubric },
    problem: { text: M.problemText(p), p }, wrong, pip: opening.text, released: false, criteria_met: [],
    notes: rule.notes,
  });
});

app.post('/api/session/:id/teach/turn', async (req, res) => {
  const s = getSession(req, res); if (!s) return;
  const q = s.queue[req.body.queueIndex ?? 0]; if (!q?.teach) return res.status(400).json({ error: 'no teach session' });
  const t = q.teach; const rule = M.byId[q.malrule];
  const { transcript = '', onsetMs = 0, gapsMs = [], durationMs = 0, asrConfidence = 1 } = req.body;

  if (t.released || t.gaveUp) return res.json({ done: true, released: t.released, pip: t.history.at(-1).text });

  // Recognizer failed: Pip asks in character. Doesn't count as a turn.
  if (!transcript.trim() || asrConfidence < 0.45) {
    const line = await pip.turn({ rule, p: t.p, history: t.history, released: false, asrLow: true });
    t.history.push({ who: 'pip', text: line.text, asrRecovery: true });
    return res.json({ pip: line.text, asrRecovery: true, released: false, criteria_met: lastMet(t), fluency: null });
  }

  const fluency = F.analyse({ transcript, onsetMs, gapsMs, durationMs });
  t.history.push({ who: 'learner', text: transcript, fluency });
  t.learnerTurns++;

  const learnerTurns = t.history.filter(h => h.who === 'learner').map(h => h.text);
  let verdict;
  try { verdict = await judge.score({ rule, p: t.p, learnerTurns }); }
  catch (e) { console.error('[judge]', e.message); verdict = judge.mockScore({ rule, learnerTurns }); }
  t.history.at(-1).judge = verdict;

  let line;
  if (verdict.released) {
    t.released = true;
    q.status = 'cleared';
    q.cleared = new Date().toISOString();
    q.quality = verdict.quality;
    q.finalVerdict = fluency.verdict;
    q.quadrant = F.quadrant(true, fluency.verdict);
    try { line = await pip.turn({ rule, p: t.p, history: t.history, released: true }); }
    catch (e) { line = { text: "…oh. Oh, that's weird. Okay, so how do I make the pieces the same size?" }; }
  } else if (t.learnerTurns >= MAX_TURNS) {
    t.gaveUp = true;
    q.status = 'stuck';
    q.quadrant = F.quadrant(false, fluency.verdict);
    line = { text: "I still don't get it. That's okay. Can we ask your tutor on Thursday?" };
  } else {
    try {
      line = await pip.turn({ rule, p: t.p, history: [...t.history, { who: 'learner', text: `(system: not convinced yet. If useful, ask something like: ${verdict.next_probe})` }].filter(h => !h.text.startsWith('(system') || llm.live()), released: false });
      if (!llm.live() && verdict.next_probe) line = { text: verdict.next_probe };
    } catch (e) { line = { text: verdict.next_probe || rule.defense(t.p) }; }
  }
  t.history.push({ who: 'pip', text: line.text });
  res.json({ pip: line.text, released: t.released, gaveUp: t.gaveUp, criteria_met: verdict.criteria_met, quality: verdict.quality, reason: verdict.reason, fluency, quadrant: q.quadrant || null, turn: t.learnerTurns, maxTurns: MAX_TURNS });
});

function lastMet(t) { const l = [...t.history].reverse().find(h => h.judge); return l ? l.judge.criteria_met : []; }

// ---- artifacts ----
app.get('/api/session/:id/brief', (req, res) => {
  const s = getSession(req, res); if (!s) return;
  const q = s.queue.find(x => x.teach) || s.queue[0];
  const t = q?.teach;
  const learnerTurns = t ? t.history.filter(h => h.who === 'learner') : [];
  const best = learnerTurns.find(h => h.judge?.released) || learnerTurns.at(-1);
  const hesitantTurns = learnerTurns.filter(h => h.fluency?.verdict === 'hesitant');
  const fmt = iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const rule = q ? M.byId[q.malrule] : null;

  const parent = q ? {
    learner: s.learner, malrule: q.malrule, name: q.name, plain: rule.kid,
    firstWrong: fmt(q.firstWrong), taught: q.status === 'cleared' ? fmt(q.cleared) : null,
    quality: q.quality ?? null, quote: best?.text || null, status: q.status,
    cleared: s.history.length + (q.status === 'cleared' ? 1 : 0), open: s.queue.filter(x => x.status !== 'cleared').length,
  } : null;

  const tutor = q ? {
    learner: s.learner, session: 'Thursday',
    bullets: [
      q.status === 'cleared'
        ? `${s.learner} taught ${q.malrule} successfully on ${fmt(q.cleared)}. Explanation quality ${q.quality}/3. ${best?.judge?.reason || ''}`.trim()
        : q.status === 'stuck'
          ? `${s.learner} could not explain ${q.malrule} after ${MAX_TURNS} attempts. Pip flagged it. Start here.`
          : `${s.learner} has ${q.malrule} open from the ${fmt(q.firstWrong)} worksheet. Not yet taught back.`,
      hesitantTurns.length
        ? `Delivery hesitant on ${hesitantTurns.length} of ${learnerTurns.length} attempts: ${hesitantTurns.map(h => `${h.fluency.onsetS}s onset, ${h.fluency.hedges} hedge${h.fluency.hedges === 1 ? '' : 's'}`).join('; ')}. ${q.status === 'cleared' ? 'Got there, and it cost tries. Treat as recent, not solid.' : ''}`.trim()
        : learnerTurns.length ? `Delivery fluent throughout (${learnerTurns.map(h => h.fluency.onsetS + 's').join(', ')} onset). Reads as solid.` : 'No spoken attempts yet.',
      rule ? `Suggested opener: ${opener(rule.id)}` : '',
    ].filter(Boolean),
    quadrant: q.quadrant || null,
    priorCleared: s.history.map(h => ({ ...h, firstWrong: fmt(h.firstWrong), cleared: fmt(h.cleared) })),
  } : null;

  res.json({ parent, tutor, queue: s.queue.map(x => ({ malrule: x.malrule, name: x.name, status: x.status, firstWrong: fmt(x.firstWrong), cleared: fmt(x.cleared), quality: x.quality ?? null })) });
});

function opener(id) {
  return {
    frac_add_across: 'ask them to draw 1/2 and 1/3 on the same bar, then ask why the pieces have to match.',
    frac_add_keep_larger_denom: 'ask why you can\'t just keep one denominator. Push for what a common denominator is.',
    frac_sub_across: 'same bar drawing as addition, then take one away.',
    frac_mul_cross: 'ask what "half of a third" means and have them shade it.',
    frac_div_straight: 'ask how many quarters fit in a half, and let them count.',
    frac_bigger_denom_bigger: 'cut a paper strip into 4, then another into 8. Compare one piece of each.',
    decimal_longer_is_bigger: 'use money: 70 cents versus 45 cents.',
  }[id] || 'start from the specific problem on the worksheet.';
}

// ---- TTS: ElevenLabs if configured, else the browser handles it ----
app.post('/api/tts', async (req, res) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(204).end();
  try {
    const voice = process.env.ELEVENLABS_VOICE_ID || 'jBpfuIE2acCO8z3wKNLl';
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_22050_32`, {
      method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ text: req.body.text, model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.45, similarity_boost: 0.8 } }),
    });
    if (!r.ok) return res.status(204).end();
    res.setHeader('content-type', 'audio/mpeg');
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.status(204).end(); }
});

// ---- spoken answer parsing for drills ----
const ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, a: 1, an: 1 };
const DENOMS = { half: 2, halves: 2, third: 3, thirds: 3, quarter: 4, quarters: 4, fourth: 4, fourths: 4, fifth: 5, fifths: 5, sixth: 6, sixths: 6, seventh: 7, sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9, tenth: 10, tenths: 10, twelfth: 12, twelfths: 12, fifteenth: 15, fifteenths: 15, sixteenth: 16, sixteenths: 16, twentieth: 20, twentieths: 20, twentyfourth: 24, twentyfourths: 24 };
function spokenToAnswer(spoken, p) {
  let s = spoken.toLowerCase().replace(/[,.!?]+$/, '').replace(/-/g, '').trim();
  if (p.op === 'compare') {
    const opts = [p.x, p.y];
    for (const o of opts) { if (s.includes(o)) return o; if (s.includes(o.replace('/', ' over ')) ) return o; }
    // spoken fractions like "one fourth"
    for (const o of opts) { const [n, d] = o.split('/'); if (n && d) { const words = Object.entries(DENOMS).filter(([, v]) => v === +d).map(([k]) => k); if (words.some(w => s.includes(w))) return o; } }
    // spoken decimals "zero point seven" / "point seven"
    const dec = s.match(/point (\w+)(?: (\w+))?/); if (dec) { const digits = [dec[1], dec[2]].filter(Boolean).map(w => ONES[w] ?? w).join(''); const cand = '0.' + digits; if (opts.includes(cand)) return cand; }
    return null;
  }
  let m = s.match(/(\d+)\s*(?:\/|over|out of)\s*(\d+)/); if (m) return `${m[1]}/${m[2]}`;
  m = s.match(/(\w+)\s+(?:over|out of)\s+(\w+)/); if (m && ONES[m[1]] != null && ONES[m[2]] != null) return `${ONES[m[1]]}/${ONES[m[2]]}`;
  m = s.match(/(\w+)\s+(\w+)$/); if (m && ONES[m[1]] != null && DENOMS[m[2]] != null) return `${ONES[m[1]]}/${DENOMS[m[2]]}`;
  m = s.match(/^(\d+)$/); if (m) return `${m[1]}/1`;
  return null;
}
function sameAnswer(p, heard, target) {
  if (p.op === 'compare') return heard === target;
  const a = M.normalizeWritten(heard), b = M.normalizeWritten(target);
  if (!a || !b || a.kind !== 'frac' || b.kind !== 'frac') return false;
  const ra = M.reduce(a.n, a.d), rb = M.reduce(b.n, b.d);
  return ra.n === rb.n && ra.d === rb.d;
}

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Understudy on http://localhost:${PORT}  mode=${llm.live() ? 'live (' + llm.MODEL + ')' : 'mock'}`));
}
module.exports = { app, spokenToAnswer };
