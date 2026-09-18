// Executable misconception library.
//
// Each malrule is a deterministic procedure that produces the wrong answer a
// learner holding that misconception would write. The model never computes
// any of these. It only voices them (Pip) or matches against them (intake).
//
// Problems are plain objects: { op, a, b, c, d } meaning a/b <op> c/d,
// or { op: 'compare', kind, x, y } for comparison problems.

'use strict';

function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y]; } return x || 1; }
function reduce(n, d) { const g = gcd(n, d); return { n: n / g, d: d / g }; }
function frac(n, d) { return { n, d }; }
function fracEq(p, q) { const a = reduce(p.n, p.d), b = reduce(q.n, q.d); return a.n === b.n && a.d === b.d; }
function fracStr(f) { return `${f.n}/${f.d}`; }

// Seeded RNG so generated problems are reproducible in tests and demos.
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

const OPS = { add: '+', sub: '−', mul: '×', div: '÷' };

function problemText(p) {
  if (p.op === 'compare') return `Which is bigger: ${p.x} or ${p.y}?`;
  return `${p.a}/${p.b} ${OPS[p.op]} ${p.c}/${p.d}`;
}

function correctAnswer(p) {
  const { a, b, c, d } = p;
  switch (p.op) {
    case 'add': return reduce(a * d + c * b, b * d);
    case 'sub': return reduce(a * d - c * b, b * d);
    case 'mul': return reduce(a * c, b * d);
    case 'div': return reduce(a * d, b * c);
    case 'compare': return p.kind === 'decimal'
      ? (parseFloat(p.x) > parseFloat(p.y) ? p.x : p.y)
      : (fracVal(p.x) > fracVal(p.y) ? p.x : p.y);
    default: throw new Error('unknown op ' + p.op);
  }
}
function fracVal(s) { const [n, d] = s.split('/').map(Number); return n / d; }

// Generate a fraction problem with unlike denominators (so malrules bite).
function genFrac(r, op) {
  const dens = [2, 3, 4, 5, 6, 8, 10, 12];
  let b = pick(r, dens), d = pick(r, dens);
  while (d === b) d = pick(r, dens);
  let a = 1 + Math.floor(r() * (b - 1));
  let c = 1 + Math.floor(r() * (d - 1));
  if (op === 'sub' && a / b < c / d) { [a, b, c, d] = [c, d, a, b]; }
  return { op, a, b, c, d };
}

const MALRULES = [
  {
    id: 'frac_add_across',
    notes: { partial: "↑ bottom = how big the pieces are", released: "wait… that's smaller than what I started with" },
    name: 'Adds numerators and denominators separately',
    kid: 'You add the tops and you add the bottoms.',
    domain: 'fraction addition',
    applies: p => p.op === 'add',
    execute: p => frac(p.a + p.c, p.b + p.d),
    defense: p => `But ${p.a} plus ${p.c} is ${p.a + p.c}, and ${p.b} plus ${p.d} is ${p.b + p.d}. I did the tops and I did the bottoms. That's how adding works.`,
    rubric: [
      'states that the denominator tells you the size of each piece',
      'explains that pieces must be the same size before you can combine them',
      'OR gives a valid magnitude argument (for example: the answer is smaller than one of the parts, so it cannot be right)',
    ],
    generate: r => genFrac(r, 'add'),
  },
  {
    id: 'frac_sub_across',
    notes: { partial: "↑ bottom = how big the pieces are", released: "wait… the pieces aren't the same size" },
    name: 'Subtracts numerators and denominators separately',
    kid: 'You take the top from the top and the bottom from the bottom.',
    domain: 'fraction subtraction',
    applies: p => p.op === 'sub' && p.b !== p.d,
    execute: p => frac(p.a - p.c, Math.abs(p.b - p.d) || 1),
    defense: p => `Top minus top is ${p.a - p.c}. Bottom minus bottom is ${Math.abs(p.b - p.d)}. Subtracting is just the same as adding but backwards.`,
    rubric: [
      'states that the denominator tells you the size of each piece',
      'explains that you need same-size pieces before taking one amount away from another',
      'OR gives a valid magnitude argument',
    ],
    generate: r => genFrac(r, 'sub'),
  },
  {
    id: 'frac_add_keep_larger_denom',
    notes: { partial: "↑ can't just keep one bottom", released: "wait… BOTH have to change to the same bottom" },
    name: 'Adds numerators and keeps the larger denominator',
    kid: 'You add the tops and keep the biggest bottom number.',
    domain: 'fraction addition',
    applies: p => p.op === 'add' && p.b !== p.d,
    execute: p => frac(p.a + p.c, Math.max(p.b, p.d)),
    defense: p => `You keep the bigger bottom because it's, like, the main one. So it's ${p.a + p.c} over ${Math.max(p.b, p.d)}.`,
    rubric: [
      'explains that you cannot just keep one of the denominators, both fractions have to be rewritten with the same one',
      'names what a common denominator is or how to find one',
      'OR shows that the answer is wrong by checking it against the size of the parts',
    ],
    generate: r => genFrac(r, 'add'),
  },
  {
    id: 'frac_mul_cross',
    notes: { partial: "↑ cross-multiply is for something else", released: "wait… times is straight across" },
    name: 'Multiplies by cross-multiplying',
    kid: 'You go top-left times bottom-right, and top-right times bottom-left.',
    domain: 'fraction multiplication',
    applies: p => p.op === 'mul',
    execute: p => frac(p.a * p.d, p.b * p.c),
    defense: p => `Cross-multiply. ${p.a} times ${p.d} on top, ${p.b} times ${p.c} on the bottom. My teacher said cross-multiply is a thing.`,
    rubric: [
      'states that multiplying fractions is straight across, top times top and bottom times bottom',
      'explains what cross-multiplying is actually for, or that it is a different procedure',
      'OR gives a valid reason the crossed answer is wrong (for example: multiplying by a fraction less than one should make the number smaller)',
    ],
    generate: r => genFrac(r, 'mul'),
  },
  {
    id: 'frac_div_straight',
    notes: { partial: "↑ dividing = how many fit inside", released: "wait… flip the second one, THEN times" },
    name: 'Divides fractions by multiplying straight across',
    kid: 'Dividing is the same as multiplying, so you just go straight across.',
    domain: 'fraction division',
    applies: p => p.op === 'div',
    execute: p => frac(p.a * p.c, p.b * p.d),
    defense: p => `${p.a} times ${p.c} is ${p.a * p.c}. ${p.b} times ${p.d} is ${p.b * p.d}. Dividing is basically multiplying anyway.`,
    rubric: [
      'explains that dividing by a fraction means asking how many of that piece fit into the first amount',
      'says you flip the second fraction and then multiply, and gives a reason why that works',
      'OR shows the straight-across answer is wrong using a concrete example',
    ],
    generate: r => genFrac(r, 'div'),
  },
  {
    id: 'frac_bigger_denom_bigger',
    notes: { partial: "↑ more pieces = smaller pieces", released: "wait… 1/8 is a smaller slice than 1/4" },
    name: 'Thinks a bigger denominator means a bigger fraction',
    kid: 'Eight is more than four, so eighths are more than fourths.',
    domain: 'fraction comparison',
    applies: p => p.op === 'compare' && p.kind === 'fraction',
    execute: p => { const [x, y] = [p.x, p.y]; return Number(x.split('/')[1]) > Number(y.split('/')[1]) ? x : y; },
    defense: p => `${p.x.split('/')[1]} is a bigger number than ${p.y.split('/')[1]}. Bigger number, bigger fraction. That's obvious.`,
    rubric: [
      'explains that the denominator is how many pieces the whole is cut into',
      'explains that cutting into more pieces makes each piece smaller',
      'OR uses a concrete example (pizza, chocolate bar) to show that 1/8 is smaller than 1/4',
    ],
    generate: r => { const d1 = pick(r, [3, 4, 5, 6]), d2 = d1 * 2; return { op: 'compare', kind: 'fraction', x: `1/${d1}`, y: `1/${d2}` }; },
  },
  {
    id: 'decimal_longer_is_bigger',
    notes: { partial: "↑ tenths come first", released: "wait… 0.7 is 0.70, that's more than 0.45" },
    name: 'Thinks a decimal with more digits is bigger',
    kid: '0.45 has more numbers in it than 0.7, so it must be bigger.',
    domain: 'decimal comparison',
    applies: p => p.op === 'compare' && p.kind === 'decimal',
    execute: p => (p.x.length > p.y.length ? p.x : p.y),
    defense: p => `${p.x.length > p.y.length ? p.x : p.y} is longer. Forty-five is way more than seven.`,
    rubric: [
      'explains that the digit right after the decimal point is tenths and it matters most',
      'lines the decimals up by place value or adds a zero to compare them',
      'OR uses money or a concrete measure to show which is actually bigger',
    ],
    generate: r => { const tenths = pick(r, [5, 6, 7, 8, 9]); const small = pick(r, [12, 25, 35, 45]); return { op: 'compare', kind: 'decimal', x: `0.${tenths}`, y: `0.${small}` }; },
  },
];

const byId = Object.fromEntries(MALRULES.map(m => [m.id, m]));

function answerStr(p, ans) {
  return p.op === 'compare' ? String(ans) : fracStr(ans);
}

// Every malrule that applies to this problem, with its wrong output rendered.
function candidates(p) {
  return MALRULES.filter(m => m.applies(p)).map(m => {
    const out = m.execute(p);
    return { id: m.id, name: m.name, wrong: answerStr(p, out), raw: out };
  }).filter(c => {
    // A malrule whose output happens to equal the right answer can't be diagnosed from this problem.
    const right = correctAnswer(p);
    return p.op === 'compare' ? c.wrong !== right : !fracEq(c.raw, right);
  });
}

// Normalise whatever a kid wrote ("2/5", "2 / 5", "0.45", "1/4") for comparison.
function normalizeWritten(s) {
  if (s == null) return null;
  const t = String(s).replace(/\s+/g, '').replace(/[⁄∕]/g, '/');
  const m = t.match(/^(-?\d+)\/(\d+)$/);
  if (m) return { kind: 'frac', n: Number(m[1]), d: Number(m[2]) };
  if (/^-?\d*\.\d+$/.test(t) || /^-?\d+$/.test(t)) return { kind: 'num', v: t };
  return { kind: 'text', v: t };
}

// The verification step: which malrules produce exactly what was written?
// This is the error-correcting code for the vision model.
function matchWritten(p, written) {
  const w = normalizeWritten(written);
  if (!w) return [];
  return candidates(p).filter(c => {
    if (p.op === 'compare') return w.kind !== 'frac' ? String(c.wrong) === w.v : fracStr(w) === c.wrong;
    if (w.kind !== 'frac') return false;
    // Kids rarely reduce. Accept exact or reduced-equal.
    return (c.raw.n === w.n && c.raw.d === w.d) || fracEq(c.raw, w);
  });
}

// Parse a printed problem like "1/2 + 1/3" or "Which is bigger: 0.7 or 0.45?".
function parseProblem(text) {
  const t = String(text).replace(/[×x*]/g, '×').replace(/[÷]/g, '÷').replace(/[−–]/g, '-').trim();
  let m = t.match(/(\d+)\s*\/\s*(\d+)\s*([+\-×÷])\s*(\d+)\s*\/\s*(\d+)/);
  if (m) {
    const op = { '+': 'add', '-': 'sub', '×': 'mul', '÷': 'div' }[m[3]];
    return { op, a: +m[1], b: +m[2], c: +m[4], d: +m[5] };
  }
  m = t.match(/(\d+\/\d+)\D+(\d+\/\d+)/);
  if (m && /bigger|larger|greater|compare|>/i.test(t)) return { op: 'compare', kind: 'fraction', x: m[1], y: m[2] };
  m = t.match(/(\d*\.\d+)\D+(\d*\.\d+)/);
  if (m) return { op: 'compare', kind: 'decimal', x: m[1], y: m[2] };
  return null;
}

module.exports = {
  MALRULES, byId, rng, candidates, matchWritten, parseProblem, problemText,
  correctAnswer, answerStr, fracStr, reduce, normalizeWritten,
};
