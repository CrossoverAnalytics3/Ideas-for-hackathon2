'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../engine/malrules');
const F = require('../engine/fluency');

test('frac_add_across produces 2/5 for 1/2 + 1/3', () => {
  const p = M.parseProblem('1/2 + 1/3');
  assert.deepEqual(p, { op: 'add', a: 1, b: 2, c: 1, d: 3 });
  const c = M.candidates(p).find(x => x.id === 'frac_add_across');
  assert.equal(c.wrong, '2/5');
  assert.equal(M.answerStr(p, M.correctAnswer(p)), '5/6');
});

test('matchWritten identifies exactly one malrule for a classic error', () => {
  const p = M.parseProblem('1/2 + 1/3');
  const hits = M.matchWritten(p, '2/5');
  assert.deepEqual(hits.map(h => h.id), ['frac_add_across']);
});

test('matchWritten returns nothing for an over-corrected reading', () => {
  const p = M.parseProblem('1/2 + 1/3');
  assert.deepEqual(M.matchWritten(p, '5/6'), []);   // the correct answer: nothing to diagnose
  assert.deepEqual(M.matchWritten(p, '7/9'), []);   // garbage
});

test('keep-larger-denominator is distinguishable from add-across', () => {
  const p = M.parseProblem('1/4 + 1/2');
  const ids = M.matchWritten(p, '2/4').map(h => h.id);
  assert.deepEqual(ids, ['frac_add_keep_larger_denom']);
  const ids2 = M.matchWritten(p, '2/6').map(h => h.id);
  assert.deepEqual(ids2, ['frac_add_across']);
});

test('every malrule generates problems where its wrong answer differs from the right one', () => {
  for (const m of M.MALRULES) {
    const r = M.rng(7);
    for (let i = 0; i < 25; i++) {
      const p = m.generate(r);
      assert.ok(m.applies(p), m.id + ' should apply to its own problem');
      const wrong = M.answerStr(p, m.execute(p));
      const right = M.answerStr(p, M.correctAnswer(p));
      assert.notEqual(wrong, right, `${m.id} collided on ${M.problemText(p)}`);
      // and the verifier finds it
      assert.ok(M.matchWritten(p, wrong).some(h => h.id === m.id), `${m.id} not matched on ${M.problemText(p)} -> ${wrong}`);
    }
  }
});

test('comparison malrules', () => {
  const p = M.parseProblem('Which is bigger: 0.7 or 0.45?');
  assert.equal(p.kind, 'decimal');
  assert.equal(M.correctAnswer(p), '0.7');
  assert.deepEqual(M.matchWritten(p, '0.45').map(h => h.id), ['decimal_longer_is_bigger']);
  const q = M.parseProblem('Which is bigger, 1/4 or 1/8?');
  assert.deepEqual(M.matchWritten(q, '1/8').map(h => h.id), ['frac_bigger_denom_bigger']);
});

test('fluency: hesitant vs fluent on the same words', () => {
  const fluent = F.analyse({ transcript: 'You need a common denominator.', onsetMs: 500, gapsMs: [], durationMs: 1800 });
  const hesitant = F.analyse({ transcript: 'You need um a common denominator? I think', onsetMs: 3400, gapsMs: [1200], durationMs: 5200 });
  assert.equal(fluent.verdict, 'fluent');
  assert.equal(hesitant.verdict, 'hesitant');
  assert.equal(F.quadrant(true, fluent.verdict).key, 'mastered');
  assert.equal(F.quadrant(true, hesitant.verdict).key, 'fragile');
});
