// The judge: scores the learner's explanation against the malrule's rubric
// and decides whether to release Pip's belief. Separate from the character
// on purpose, so pushback alone can never flip the state.

'use strict';
const llm = require('./llm');

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['criteria_met', 'released', 'quality', 'next_probe', 'reason'],
  properties: {
    criteria_met: { type: 'array', items: { type: 'integer' }, description: '1-based indices of rubric criteria the explanation satisfies.' },
    released: { type: 'boolean', description: 'True only if the explanation names the actual principle well enough that a 9-year-old could act on it.' },
    quality: { type: 'integer', minimum: 0, maximum: 3, description: '0 = no explanation, 1 = partial or procedural only, 2 = names the principle, 3 = names it with a concrete example or magnitude check.' },
    next_probe: { type: 'string', description: 'If not released: the single most useful question Pip should ask next, in a 9-year-old\'s words. Empty string if released.' },
    reason: { type: 'string', description: 'One sentence for the tutor brief.' },
  },
};

const SYSTEM = `You are a strict but fair judge of a child's spoken explanation of a math idea. You are given the misconception the child is trying to correct, a rubric, and the transcript of what the child said so far. Decide whether the explanation actually names the underlying principle. Procedural instructions alone ("just find a common denominator", "flip the second one") do NOT count as understanding and must not release. Restating that the answer is wrong does not count. Be generous with imperfect kid language and strict about substance. Ignore filler words.`;

async function score({ rule, p, learnerTurns }) {
  const transcript = learnerTurns.map((t, i) => `Turn ${i + 1}: "${t}"`).join('\n');
  if (!llm.live()) return mockScore({ rule, learnerTurns });

  return llm.json({
    system: SYSTEM,
    content: `Misconception the child is correcting: ${rule.name} ("${rule.kid}").
Rubric (any one fully met with substance can release, but procedural-only never does):
${rule.rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Everything the child has said, in order:
${transcript}

Judge the cumulative explanation.`,
    schema: SCHEMA, effort: 'medium',
  });
}

// Keyword judge for MOCK=1. Deliberately simple, deliberately strict.
function mockScore({ rule, learnerTurns }) {
  const all = learnerTurns.join(' ').toLowerCase();
  const met = [];
  const principle = /(size|big|small)\b.*\b(piece|part|slice)|(piece|part|slice)s?\b.*\b(size|big|small)|how many (pieces|parts)|cut into/;
  const sameSize = /same size|same kind|equal (pieces|parts)|common denominator.*because|match(ing)? (pieces|bottoms)/;
  const magnitude = /(more|bigger|less|smaller) than (a )?half|smaller than (what|the one) (i|you) started|can't be (right|smaller)|should be (bigger|more)|less than (one|1) of/;
  if (principle.test(all)) met.push(1);
  if (sameSize.test(all)) met.push(2);
  if (magnitude.test(all)) met.push(3);
  const proceduralOnly = /common denominator|flip|cross|straight across/.test(all) && met.length === 0;
  const released = met.includes(3) || (met.includes(1) && met.includes(2));
  const quality = released ? (met.includes(3) ? 3 : 2) : (met.length ? 1 : 0);
  return {
    criteria_met: met, released, quality,
    next_probe: released ? '' : proceduralOnly ? "But why do the bottoms have to be the same? What's the bottom number even for?" : met.includes(1) ? 'Okay so the bottom is the piece size. So why can\'t I just add them?' : 'But why is it wrong? Two plus three IS five.',
    reason: released ? 'Explanation named the principle.' : proceduralOnly ? 'Procedural only, no principle stated.' : met.length ? 'Partial: piece size named, no completion.' : 'No explanation yet.',
  };
}

module.exports = { score, mockScore };
