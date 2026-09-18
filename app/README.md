# Understudy (app)

**Two ways to run it.** `hosted.html` is the whole product in one file with no server: open it
anywhere, or publish it as a claude.ai artifact where Pip and the judge run on the viewer's own
Claude through the `sample` capability. `server.js` + `public/` is the Node version that calls
the API directly with your key. Same engine in both.

A parent photographs the graded worksheet. Understudy reads the wrong *rule* behind each
wrong answer, then gives the kid an AI understudy, Pip, who's stuck on exactly that rule.
The kid talks him out of it, out loud. Pip stays wrong until the explanation is actually right.

The concept, evidence and design live one directory up in [`../README.md`](../README.md)
and [`../docs/`](../docs/).

## Run it in 60 seconds, no keys

```bash
cd app
npm install
npm run dev          # MOCK=1: scripted Pip, keyword judge, pre-read sample worksheet
open http://localhost:3000
```

Click **Use the sample worksheet**, then **Teach Pip**. Use Chrome, hold the button, talk.

## Run it live

```bash
export ANTHROPIC_API_KEY=sk-ant-...     # or `ant auth login`
npm start
```

Live mode turns on three model calls:

| Where | What the model does | What the model never does |
|---|---|---|
| Intake | Reads the photo, answers a **closed** question: which candidate malrule matches the digits written | Decide the answer. Code runs every candidate and verifies which one produces the written digits. |
| Pip | Voices a precomputed wrong answer in a 9-year-old's words, defends it | Compute anything. The wrong answer is executable code; a regex guard regenerates if the right answer leaks. |
| Judge | Scores the spoken explanation against the malrule's rubric, decides release | Get influenced by pushback. It never sees Pip's lines, only the learner's. |

Everything else (fluency signal, drills, brief, spacing state) is deterministic.

Optional:

```bash
export ELEVENLABS_API_KEY=...            # a real child voice for Pip; otherwise the browser's synthesizer
export ELEVENLABS_VOICE_ID=...           # defaults to a young voice
export MODEL=claude-opus-5               # default
export NO_FALLBACKS=1                    # disable server-side refusal fallbacks
```

If anything fails on a live call (network, refusal, quota) the server falls back to the
scripted path for that step and keeps going. That's deliberate: the demo video never dies
on camera.

## What's where

```
engine/malrules.js   7 executable misconceptions: applies / execute / defense / rubric / generate
engine/intake.js     photo -> closed-question vision call -> code verification
engine/pip.js        the character; system prompt pins the belief; leak guard
engine/judge.js      structured-output rubric judge; keyword fallback
engine/fluency.js    onset, fillers, hedges, pauses -> fluent / hesitant -> quadrant
engine/llm.js        the only file that talks to Claude; MOCK switch
server.js            Express API + in-memory sessions + brief generation + spoken-answer parsing
public/index.html    intake (photo / sample worksheet / confirm unverified)
public/drill.html    warm-up: 3 fresh problems on the malrule, answered by voice
public/teach.html    the Pip screen: rig, shared paper, belief strip, fluency strip, push-to-talk
public/brief.html    parent card + tutor brief + misconceptions over time
public/pip.js        procedural SVG rig, 10 expressions
public/voice.js      push-to-talk (Web Speech API) with timing; TTS via /api/tts or browser
test/                unit tests (node --test) and a headless end-to-end smoke test
```

## Tests

```bash
npm test             # engine: every malrule generates problems its own verifier catches
npm run smoke        # headless Chromium walks photo -> drill -> teach -> brief in mock mode
npm run dryrun       # drives the live code paths against a stubbed client: request shapes, role alternation, leak guard
```

The smoke test removes speech recognition from the page so the typed fallback appears; it
also renders `public/sample-worksheet.png` from `sample-worksheet.html`.

## Deploy

Any Node host. Railway / Render / Fly: set `ANTHROPIC_API_KEY`, start command `npm start`.
The app is one process, no database, sessions in memory (fine for a demo, not for production).

## Voice notes

- Speech recognition is the browser's (Chrome, Edge, Safari 14.1+). Firefox shows a typed fallback.
- Onset latency is measured from the end of Pip's line to the first recognized word, capped at 8s.
- Fillers and hedges come from the transcript. Chrome's recognizer drops some "um"s; a
  timestamped ASR (Deepgram with `filler_words`, or Whisper `word_timestamps`) is the upgrade.
- Fluency thresholds are hand-picked for the demo. The product scores against each learner's
  own baseline. See `../docs/voice-layer.md` for why (math anxiety confound).

## Known limits

- Live mode was written against the SDK reference and exercised in mock mode only in the
  build sandbox (no credentials there). Run it once with your key before recording.
- Malrule coverage is 7 rules across fraction arithmetic, fraction comparison and decimal
  comparison. MalruleLib (ACL 2026) documents 101; the shape here extends directly.
- Photo intake expects printed problems with handwritten answers. Fully handwritten problems
  will parse less reliably; the "confirm" path covers it.
