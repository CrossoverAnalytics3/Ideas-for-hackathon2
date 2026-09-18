// Fluency signal: how the learner said it, independent of what they said.
//
// Input is a transcript plus timing the client measured:
//   onsetMs   time from the end of Pip's line to the learner's first word
//   gapsMs    gaps between recognised chunks while speaking (ms)
//   durationMs total speaking time
//
// Thresholds are hand-picked for the demo. The product scores against each
// learner's own baseline (see docs/voice-layer.md); a global cutoff mislabels
// anxious kids, 77% of whom are normal-to-high achievers.

'use strict';

const FILLERS = ['um', 'uh', 'er', 'erm', 'hmm', 'like'];
const HEDGES = ['i think', 'maybe', 'kinda', 'kind of', 'sort of', 'i guess', 'probably', 'i dunno', "i don't know", 'or something'];

function count(text, phrases) {
  const t = ' ' + text.toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
  return phrases.reduce((n, p) => n + (t.split(' ' + p + ' ').length - 1), 0);
}

function analyse({ transcript = '', onsetMs = 0, gapsMs = [], durationMs = 0 }) {
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const fillers = count(transcript, FILLERS);
  const hedges = count(transcript, HEDGES);
  const longPauses = gapsMs.filter(g => g > 800).length;
  const restarts = (transcript.match(/\b(\w+)\s+\1\b/gi) || []).length + (transcript.match(/\b(no wait|i mean|actually)\b/gi) || []).length;
  const uptalk = /\?\s*$/.test(transcript.trim());

  // Score: each signal adds hesitation. Two or more points reads as hesitant.
  let score = 0;
  if (onsetMs > 2000) score += 1;
  if (onsetMs > 3500) score += 1;
  if (words >= 4 && fillers / words > 0.06) score += 1;
  if (hedges > 0) score += 1;
  if (longPauses > 0) score += 1;
  if (restarts > 0) score += 0.5;
  if (uptalk) score += 0.5;

  return {
    words, fillers, hedges, longPauses, restarts, uptalk,
    onsetS: +(onsetMs / 1000).toFixed(1),
    durationS: +(durationMs / 1000).toFixed(1),
    score,
    verdict: score >= 2 ? 'hesitant' : 'fluent',
  };
}

// Cross correctness with delivery: the four-state read.
function quadrant(correct, verdict) {
  if (correct && verdict === 'fluent') return { key: 'mastered', label: 'Mastered', action: 'Space it far out.' };
  if (correct) return { key: 'fragile', label: 'Fragile', action: 'Looks like mastery on a quiz. Re-queue in 2 days.' };
  if (verdict === 'fluent') return { key: 'confidently_wrong', label: 'Confidently wrong', action: 'Entrenched malrule. Flag the tutor now.' };
  return { key: 'stuck', label: 'Honestly stuck', action: 'Normal. Just teach it.' };
}

module.exports = { analyse, quadrant, FILLERS, HEDGES };
