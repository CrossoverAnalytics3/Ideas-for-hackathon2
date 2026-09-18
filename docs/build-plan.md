# Build plan: 12 hours to the buzzer

Submissions close **Friday Sept 18, 2026, 11:59 PM CDT**. It's 11:44 AM CDT now.
That's roughly 12 hours, and the deliverable is a project link plus a 2-3 minute demo video.

Ship one subject, one malrule library, one flawless scripted path. Judges watch a video.
They will not stress-test your edge cases.

## What gets cut immediately

- Auth, accounts, databases. Everything in memory or a JSON file.
- Mobile. Web only.
- The literacy and language libraries. Mention them on a slide, build fractions.
- Child-tuned speech recognition. Use an off-the-shelf streaming ASR and demo with a clear
  speaker. Name the 4-8x child WER gap in the video as known work, and show Pip's in-character
  recovery line handling it.
- Any parent dashboard beyond a single rendered card.

## Hours 0-2: the malrule engine

The library now does double duty: it makes Pip stubborn *and* it error-corrects the vision
model at intake. Build it first for both reasons.

This is the part that wins, so build it first and build it in plain Python or TypeScript.

```python
MALRULES = {
  "frac_add_across": {
    "id": "frac_add_across",
    "name": "Adds numerators and denominators separately",
    "applies_to": "fraction addition",
    "execute": lambda a, b, c, d: (a + c, b + d),          # 1/2 + 1/3 -> 2/5
    "correct": lambda a, b, c, d: simplify(a*d + c*b, b*d),
    "defense": "The tops add and the bottoms add. That's how adding works.",
    "release_rubric": [
      "states that the denominator names the size of the piece",
      "explains that pieces must be the same size before combining",
      "OR gives a valid magnitude argument (the sum must exceed 1/2)",
    ],
  },
  # 4 more: frac_sub_across, decimal_longer_is_bigger, mult_always_makes_bigger,
  #         neg_sign_dropped
}
```

Five malrules is plenty. Each one needs `execute`, a stubborn `defense` line, and a
release rubric. The rubric is what the judge model scores against.

**Test it standalone before touching any UI.** Feed it 20 fresh problems and confirm the
wrong answers are the wrong answers a real kid produces.

## Hours 2-3: photo intake

90 minutes, and it buys the best 20 seconds of the demo video: a real crumpled worksheet with
real red pen, held up to a real camera. A physical object on screen beats every slide anyone
else will show.

Scope it hard. **One photo, hardcoded fallback ready.** A single vision call, constrained:

```
"Here is a graded math problem and the student's written answer.
 Candidates: [frac_add_across → 2/5, frac_add_cross → 5/6, ...]
 Which candidate matches what is written? Return the id, or 'none'."
```

Closed set, not free transcription. Then verify: run each candidate malrule and check which
produces the digits. One match means high confidence. No match means probable over-correction,
so ask the parent to confirm rather than guessing.

**Shoot the photo yourself in good light.** Write the worksheet by hand, mark it in red, and
take the picture before you write any code, so you're developing against the real image.
Keep a hardcoded result path so a failed API call on camera doesn't kill the take.

## Hours 3-5: the two-model loop

Two calls, clearly separated. Keep them separate in the code, because you're going to show
this architecture on screen.

**Call 1, the Understudy.** System prompt receives the malrule name, the problem, and the
precomputed wrong answer. It never computes anything. Instructions: you are Pip, 9 years
old, you believe this rule, you say this answer, you defend it when challenged, you never
reveal the correct method, you may ask questions.

Add a hard constraint in the prompt and a regex check on output: if the correct answer
string ever appears before the pin is released, regenerate. That guard is a good 5 seconds
of demo footage.

**Call 2, the judge.** Receives the kid's transcript and the release rubric. Returns
`{released: bool, criteria_met: [...], quality: 0-3, next_probe: "..."}`. Structured output,
low temperature. If not released, the `next_probe` becomes Pip's follow-up question.

State machine, nothing fancier:

```
WRONG ──(judge: released=false)──► WRONG (Pip asks next_probe)
WRONG ──(judge: released=true)───► CONVINCED ──► artifact
```

Cap it at 4 turns. If the kid can't get there, Pip says "I still don't get it, can we ask
your tutor?" and the session flags for the tutor brief. **Build that path.** Refusing to
hand out a fake win is the most honest thing in the product and worth 10 seconds of video.

## Hours 5-7: voice, which is now the whole interface

Speech-to-speech realtime APIs are tempting and wrong for this. They put the answer back
inside the model, which breaks the belief pin, and they hide the word timings you need for
the fluency signal. Keep the pipeline in pieces.

```
mic ──► streaming ASR (word-level timestamps) ──► transcript + timing
                                                        │
                            ┌───────────────────────────┴──────────┐
                            ▼                                      ▼
                   judge model (content)              fluency extractor (delivery)
                            └───────────────┬──────────────────────┘
                                            ▼
                                   state machine ──► Pip's line ──► TTS ──► speaker
```

**Pick an ASR with word-level timestamps.** Non-negotiable. Onset latency and pause
durations are the fluency signal, and a plain transcript throws them away. Deepgram or
Whisper with `word_timestamps` both work.

**Fluency extractor is 40 lines, not an ML problem.** From the timestamps:

```python
onset_ms    = first_word.start - prompt_end          # retrieval difficulty
filler_rate = count(["um","uh","er","like"]) / words
hedge_rate  = count(["i think","maybe","kinda","i guess","probably"]) / words
long_pauses = [g for g in gaps(words) if g > 800]    # planning stalls
restarts    = count_self_repairs(transcript)
```

Bucket it fluent/hesitant with thresholds you pick by hand. Anything fancier is not a
12-hour problem, and the quadrant reads the same on video either way.

**Say the baseline caveat out loud instead of building it.** Absolute thresholds mislabel
anxious kids, 77% of whom are normal-to-high achievers. The product scores fluency against
each learner's own profile; the demo can't, because there's no week of history. One sentence
in the video covers it and reads as rigour rather than a gap.

**TTS needs a child voice.** An adult-sounding tutee breaks the frame instantly. Spend
15 minutes picking the voice. It matters more than it sounds like it does.

**Build the "say that again" path early.** Low ASR confidence, Pip asks in character. It's
three lines of code and it's the thing that keeps the demo alive when the recognizer
mangles a word on camera.

**Push to talk.** Always-on listening will pick up a sibling and ruin a take.

## Hours 7-9: the UI

One page. Pip on the left as a simple animated SVG. Live transcript in the middle.
Push-to-talk button at the bottom.

Three states on Pip's face: confused, thinking, got it. Do not build a character rig.
Three SVGs and a CSS transition reads fine on video.

Above the transcript, a live "belief state" strip showing `holding: frac_add_across` in
red, flipping to green on release. That's the visual proof that you pinned the belief
rather than crossing your fingers on a prompt. Nobody else's demo will have this.

Under the transcript, a second strip for the fluency read: onset time, pause count, hedge
count, ticking up live as the kid speaks. Two strips, two signals, and the whole
architecture is legible from a screenshot.

## Hours 9-10: the two artifacts

**Parent card.** Static render: kid's name, the misconception, the date they first got it
wrong, the date they taught it, an explanation-quality score, and **a play button on the
40-second audio clip of their kid explaining it.** One HTML card. The audio is what makes
this an object a parent forwards to a grandparent, and it's the slide that connects your
demo to Nerdy's churn problem.

**Tutor brief.** Three bullets, and the fluency read is the part a tutor can't get
anywhere else. "Maya taught frac_add_across successfully on Sept 18. Explanation quality
3/3, used a magnitude argument. **Delivery hesitant: 3.1s onset, four hedges. Correct but
fragile.** Still shaky on why common denominators work. Suggested opener: ..."

## Hours 10-11:30: the video

2 minutes 40 seconds. Rehearse it twice, record once.

| Time | Beat |
|---|---|
| 0:00-0:20 | Hold up a real graded worksheet, red pen and all. "Every house has a pile of these. They go in the recycling." Photograph it on camera; the app names the rule behind the mistake. Physical object, no slide. |
| 0:20-0:35 | The finding: a 2026 study found the plain AI chatbot produced the highest perceived understanding and the lowest actual learning of four designs. Then the hook. "A session is 60 minutes of talking. Then the kid taps a screen in silence for a week." |
| 0:35-1:15 | Live demo, audio up. Maya teaching Pip out loud. Let Pip resist once. Let the silence sit. |
| 1:15-1:40 | The architecture diagram. Say the sycophancy problem out loud, cite the 66% to 40% drop, show the executable malrule and the belief strip flipping. Then the payoff line: the same library error-corrects the vision model at intake. One idea, both ends. |
| 1:40-2:05 | The quadrant. Play two clips of the same correct answer, one fluent, one hesitant, and show them landing in different boxes. This is the "why voice" proof and it needs no explanation. |
| 2:05-2:18 | The refusal path. Pip not getting it, the flag going to the tutor. |
| 2:18-2:38 | Parent card with the audio clip playing, and the tutor brief. Name the retention mechanic. |
| 2:38-2:50 | Same engine, three malrule libraries, three subjects. One slide. |

Record the demo screen capture first, separately, so a flaky API call doesn't cost you a
whole take. Voiceover after.

**Record in a quiet room and use a real microphone.** The product is about audio. Bad audio
in the demo undercuts the entire argument, and judges will feel it before they can name it.

## Hours 11:30-12: submit

README at the repo root explaining the mechanic in 200 words. Deploy anywhere that gives a
public URL. Submit early, since the rules say entries are reviewed as they arrive.

## The two things that will kill this

1. **Pip caves.** If the model breaks character on the first push, the demo is dead. This
   is exactly why the answer comes from code and the release comes from a separate judge.
   Test the stubbornness before you build anything pretty.
2. **Voice latency.** 4 seconds of dead air on video feels like a minute. Stream in both
   directions and budget under 1.5s from end-of-speech to Pip's first syllable. If you
   can't hit it, cut the dead air in the edit rather than cutting voice, because voice is
   the argument now.
3. **ASR mangling the demo take.** Build Pip's in-character "say that again" line before you
   build anything pretty, and it becomes a feature on camera rather than a retake.
4. **The vision model over-correcting your worksheet.** It's the documented failure and it
   will happen. Constrain to the candidate set, verify against the executable rules, and keep
   a hardcoded result behind the camera path for the recording.
