// Photo intake: read graded work, diagnose the malrule, verify in code.
//
// The vision model is asked a CLOSED question: for each problem marked
// wrong, transcribe the printed problem and the student's written answer,
// and pick which candidate wrong answer it matches. Then the code runs
// every candidate malrule and checks which one actually produces the
// written digits. Agreement = verified. Disagreement = ask the parent.
// That is the error-correcting code for over-correcting OCR.

'use strict';
const M = require('./malrules');
const llm = require('./llm');

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['problems'],
  properties: {
    problems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['problem_text', 'written_answer', 'marked_wrong', 'matched_candidate_id', 'reading_confidence'],
        properties: {
          problem_text: { type: 'string', description: 'The printed problem exactly as it appears, e.g. "1/2 + 1/3" or "Which is bigger: 0.7 or 0.45?"' },
          written_answer: { type: 'string', description: 'What the student wrote, exactly, even if it is wrong. Never correct it. e.g. "2/5"' },
          marked_wrong: { type: 'boolean', description: 'True if the grader marked this problem wrong (red X, circle, minus, cross-out).' },
          matched_candidate_id: { type: ['string', 'null'], description: 'Which candidate id from the list produces what the student wrote, or null if none.' },
          reading_confidence: { type: 'number', description: '0 to 1: how sure you are you read the written answer correctly.' },
        },
      },
    },
  },
};

const SYSTEM = `You read photographs of graded school math work. Your only job is to transcribe faithfully.
Critical rule: NEVER correct the student's answer. If the student wrote 2/5, return "2/5" even though it is wrong. Copy the digits on the page. Transcription errors that "fix" the mistake are the worst possible failure here.
Ignore names, teacher comments and anything that is not a problem and its written answer.`;

function candidateList(problemText) {
  const p = M.parseProblem(problemText);
  if (!p) return null;
  return M.candidates(p).map(c => `${c.id} => ${c.wrong}`).join('; ');
}

async function diagnose({ imageBase64, mediaType }) {
  if (!llm.live()) return mockDiagnosis();

  // Pass 1: find problems and written answers (open read, but instructed not to correct).
  const first = await llm.json({
    system: SYSTEM,
    content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
      { type: 'text', text: 'List every problem on the page with what the student wrote. For matched_candidate_id use null on this pass.' },
    ],
    schema: SCHEMA, effort: 'medium',
  });

  // Pass 2: closed question per marked-wrong problem, then code verification.
  const results = [];
  for (const item of first.problems) {
    const p = M.parseProblem(item.problem_text);
    if (!p) { results.push({ ...item, status: 'unparsed' }); continue; }
    const cands = M.candidates(p);
    const codeMatch = M.matchWritten(p, item.written_answer);
    let modelPick = null;
    if (item.marked_wrong && cands.length) {
      const q = await llm.json({
        system: SYSTEM,
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: `Look only at the problem "${item.problem_text}". Candidate wrong answers a student holding a known misconception would write: ${cands.map(c => `${c.id} => ${c.wrong}`).join('; ')}. Which candidate id matches the digits the student actually wrote? Return exactly one problem entry.` },
        ],
        schema: SCHEMA, effort: 'medium',
      });
      modelPick = q.problems[0]?.matched_candidate_id || null;
    }
    results.push(verify({ item, p, cands, codeMatch, modelPick }));
  }
  return { problems: results, mode: 'live' };
}

function verify({ item, p, cands, codeMatch, modelPick }) {
  const correct = M.answerStr(p, M.correctAnswer(p));
  const base = {
    problem_text: M.problemText(p), problem: p, written_answer: item.written_answer,
    marked_wrong: item.marked_wrong, correct, candidates: cands,
    reading_confidence: item.reading_confidence,
  };
  if (!item.marked_wrong) return { ...base, status: 'correct' };
  if (codeMatch.length === 1 && (!modelPick || modelPick === codeMatch[0].id)) {
    return { ...base, status: 'verified', malrule: codeMatch[0].id, name: M.byId[codeMatch[0].id].name };
  }
  if (codeMatch.length === 1) {
    // Code and model disagree: trust the code, flag it.
    return { ...base, status: 'verified', malrule: codeMatch[0].id, name: M.byId[codeMatch[0].id].name, note: `model picked ${modelPick}, code matched ${codeMatch[0].id}` };
  }
  if (codeMatch.length > 1) {
    return { ...base, status: 'ambiguous', options: codeMatch.map(c => c.id) };
  }
  // No malrule makes those digits. Likely an over-corrected reading. Ask the parent.
  return { ...base, status: 'unverified', modelPick, note: 'No malrule produces the written digits. The reading may have been auto-corrected. Please confirm.' };
}

// Zero-key mode: the demo worksheet, pre-read.
function mockDiagnosis() {
  const items = [
    { problem_text: '1/2 + 1/3', written_answer: '2/5', marked_wrong: true, reading_confidence: 0.93 },
    { problem_text: '3/4 − 1/2', written_answer: '1/4', marked_wrong: false, reading_confidence: 0.97 },
    { problem_text: '1/4 + 1/2', written_answer: '2/4', marked_wrong: true, reading_confidence: 0.9 },
    { problem_text: 'Which is bigger: 0.7 or 0.45?', written_answer: '0.45', marked_wrong: true, reading_confidence: 0.95 },
  ];
  const problems = items.map(item => {
    const p = M.parseProblem(item.problem_text);
    return verify({ item, p, cands: M.candidates(p), codeMatch: M.matchWritten(p, item.written_answer), modelPick: null });
  });
  return { problems, mode: 'mock' };
}

module.exports = { diagnose, verify, mockDiagnosis };
