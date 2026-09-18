// Pip: the understudy. Holds one malrule. Never computes anything.
//
// The wrong answer is precomputed by the malrule and handed to the model.
// The model's only job is to say it in a 9-year-old's voice and defend it
// in character. A regex guard regenerates if the correct answer leaks
// before the pin is released.

'use strict';
const M = require('./malrules');
const llm = require('./llm');

function system({ rule, p, wrong, correct, released, probe }) {
  const base = `You are Pip, a 9-year-old kid. You are being taught by an older kid who is helping you with math. Speak like a real 9-year-old: short sentences, plain words, a little stubborn, curious, never sarcastic. One to three sentences per turn. Never use bullet points or headings.`;
  if (released) {
    return `${base}
You JUST understood why your old way was wrong. You are surprised and a little delighted. You may now say the right idea in your own words, and you ask ONE follow-up question about what to do next. Do not lecture.`;
  }
  return `${base}
You firmly believe this rule: "${rule.kid}" (${rule.name}).
For the problem ${M.problemText(p)} you wrote ${wrong} and you are sure it is right.
The correct answer is ${correct}. You must NEVER say "${correct}", never hint at it, never agree the older kid is right, and never explain the correct method. You do not know it.
When challenged: restate your rule, apply it again, or ask a genuine "but why?" question. If the older kid says something vague like "that's wrong" or "just flip it", push back and ask them to explain. If they explain a real principle, you may say "hm" and ask a follow-up, but you still get the answer wrong until told otherwise by the system.${probe ? `\nA good question to ask next, if it fits: "${probe}"` : ''}`;
}

async function turn({ rule, p, history, released, asrLow, probe }) {
  const wrong = M.answerStr(p, rule.execute(p));
  const correct = M.answerStr(p, M.correctAnswer(p));

  if (asrLow) return { text: pickOne(["Wait, say that again? I didn't catch it.", "Huh? Say that one more time.", "I didn't get that. Can you say it again?"]) };

  if (!llm.live()) return { text: mockLine({ rule, p, wrong, history, released }) };

  const messages = history.length ? history.map(h => ({ role: h.who === 'pip' ? 'assistant' : 'user', content: h.text }))
    : [{ role: 'user', content: `(The older kid sits down next to you.) Show me what you got for ${M.problemText(p)}.` }];
  if (messages[0].role !== 'user') messages.unshift({ role: 'user', content: `Show me what you got for ${M.problemText(p)}.` });
  // An ASR-recovery line gives Pip two turns in a row; the API wants alternation.
  const merged = [];
  for (const m of messages) { const last = merged.at(-1); if (last && last.role === m.role) last.content += '\n' + m.content; else merged.push({ ...m }); }
  if (merged.at(-1).role !== 'user') merged.push({ role: 'user', content: '(waits for you to say something)' });

  for (let attempt = 0; attempt < 3; attempt++) {
    const text = await llm.text({ system: system({ rule, p, wrong, correct, released, probe }), messages: merged, effort: 'low', maxTokens: 200 });
    if (released || !leaks(text, correct, p)) return { text };
    console.warn('[pip] leaked correct answer, regenerating');
  }
  return { text: rule.defense(p) };
}

function leaks(text, correct, p) {
  const t = text.replace(/\s+/g, '');
  if (t.includes(correct.replace(/\s+/g, ''))) return true;
  if (p.op !== 'compare') {
    const [n, d] = correct.split('/');
    if (new RegExp(`${n}\\s*(over|/)\\s*${d}`, 'i').test(text)) return true;
  }
  return false;
}

// Scripted lines for MOCK=1. Also the on-camera fallback.
function mockLine({ rule, p, wrong, history, released }) {
  const kidTurns = history.filter(h => h.who === 'learner').length;
  if (released) return `…oh. Oh, that's weird. So my way gives a smaller number than I started with. Okay so how do I make the pieces the same size?`;
  if (kidTurns === 0) return `${rule.kid} So I got ${wrong}.`;
  if (kidTurns === 1) return rule.defense(p);
  if (kidTurns === 2) return `Okay… so you're saying the bottom number is how big the pieces are? I still get ${wrong} though.`;
  return `Hm. I don't get it yet. Can you say it a different way?`;
}

function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }

module.exports = { turn, leaks };
