// Stub the Anthropic client and drive the live code paths to validate request shapes.
// Run: node test/dryrun-live.js   (no network, no key needed)
process.env.ANTHROPIC_API_KEY = 'sk-ant-dryrun';
const Anthropic = require('@anthropic-ai/sdk');
const calls = [];
function fake(params) {
  calls.push(params);
  // roles must alternate and start with user
  const roles = params.messages.map(m => m.role);
  if (roles[0] !== 'user') throw new Error('first message not user: ' + roles);
  for (let i = 1; i < roles.length; i++) if (roles[i] === roles[i - 1]) throw new Error('consecutive roles: ' + roles.join(','));
  const fmt = params.output_config?.format;
  let text;
  if (fmt) {
    const props = fmt.schema.properties;
    if (props.problems) text = JSON.stringify({ problems: [{ problem_text: '1/2 + 1/3', written_answer: '2/5', marked_wrong: true, matched_candidate_id: 'frac_add_across', reading_confidence: 0.9 }, { problem_text: '3/4 − 1/2', written_answer: '1/4', marked_wrong: false, matched_candidate_id: null, reading_confidence: 0.95 }] });
    else text = JSON.stringify({ criteria_met: [1, 3], released: true, quality: 3, next_probe: '', reason: 'named the principle' });
  } else text = 'Um, but the tops make two and the bottoms make five. Two fifths. So my answer is right.';
  return Promise.resolve({ stop_reason: 'end_turn', content: [{ type: 'text', text }], usage: {} });
}
const client = new Anthropic();
// monkeypatch instance methods used by llm.js
const llm = require('../engine/llm');
const proto = Object.getPrototypeOf(client.beta.messages);
proto.create = fake;
Object.getPrototypeOf(client.messages).create = fake;
(async () => {
  const intake = require('../engine/intake'), pip = require('../engine/pip'), judge = require('../engine/judge'), M = require('../engine/malrules');
  console.log('live?', llm.live());
  const d = await intake.diagnose({ imageBase64: 'iVBORw0KGgo=', mediaType: 'image/png' });
  console.log('intake:', d.problems.map(p => [p.status, p.malrule].join(':')).join(' | '));
  const rule = M.byId.frac_add_across, p = { op: 'add', a: 2, b: 3, c: 5, d: 6 };
  const open = await pip.turn({ rule, p, history: [], released: false });
  console.log('pip opening ok:', !!open.text, '| leak guard hit:', open.text === rule.defense(p));
  const hist = [{ who: 'pip', text: open.text }, { who: 'learner', text: 'that is wrong' }];
  const t2 = await pip.turn({ rule, p, history: hist, released: false, probe: 'but why though?' });
  console.log('pip turn ok:', !!t2.text);
  const j = await judge.score({ rule, p, learnerTurns: ['half plus a third is more than half'] });
  console.log('judge:', j.released, j.criteria_met);
  const asr = await pip.turn({ rule, p, history: [...hist, { who: 'pip', text: t2.text }, { who: 'pip', text: 'Say that again?' }], released: false });
  console.log('pip after ASR recovery ok:', !!asr.text);
  const rel = await pip.turn({ rule, p, history: [...hist, { who: 'pip', text: t2.text }, { who: 'learner', text: 'pizza argument' }], released: true });
  console.log('pip released ok:', !!rel.text);
  console.log('calls:', calls.length, '| image blocks:', calls.filter(c => JSON.stringify(c.messages).includes('"type":"image"')).length, '| betas:', [...new Set(calls.map(c => JSON.stringify(c.betas)))].join(' '));
  console.log('system prompt has probe:', calls.some(c => /good question to ask next/.test(c.system || '')));
})().catch(e => { console.error('DRYRUN FAILED', e); process.exit(1); });
