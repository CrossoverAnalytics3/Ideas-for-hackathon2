# Build plan: 12 hours to the buzzer

Submissions close **Friday Sept 18, 2026, 11:59 PM CDT**. It's 11:44 AM CDT now.
That's roughly 12 hours, and the deliverable is a project link plus a 2-3 minute demo video.

Ship one subject, one malrule library, one flawless scripted path. Judges watch a video.
They will not stress-test your edge cases.

## What gets cut immediately

- Auth, accounts, databases. Everything in memory or a JSON file.
- Mobile. Web only.
- The literacy and language libraries. Mention them on a slide, build fractions.
- Kid speech recognition tuned for 8-year-olds. Use browser Web Speech API or Whisper and
  demo with a clear speaker. Note the Amira-grade ASR problem as known future work.
- Any parent dashboard beyond a single rendered card.

## Hours 0-2: the malrule engine

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

## Hours 2-5: the two-model loop

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

## Hours 5-8: the UI

One page. Pip on the left as a simple animated SVG. Chat transcript in the middle.
Push-to-talk button at the bottom.

Three states on Pip's face: confused, thinking, got it. Do not build a character rig.
Three SVGs and a CSS transition reads fine on video.

Above the chat, a live "belief state" strip showing `holding: frac_add_across` in red,
flipping to green on release. That's the visual proof that you pinned the belief rather
than crossing your fingers on a prompt. Nobody else's demo will have this.

## Hours 8-9: the two artifacts

**Parent card.** Static render: kid's name, the misconception, the date they first got it
wrong, the date they taught it, an explanation-quality score, and a pull quote from the
transcript. One HTML card. Ten minutes of work, and it's the slide that connects your demo
to Nerdy's churn problem.

**Tutor brief.** Three bullets. "Maya taught frac_add_across successfully on Sept 18.
Explanation quality 3/3, used a magnitude argument. Still shaky: why common denominators
work. Suggested opener: ..."

## Hours 9-11: the video

2 minutes 40 seconds. Rehearse it twice, record once.

| Time | Beat |
|---|---|
| 0:00-0:20 | Nerdy's number: memberships down 5%, the 167 hours between sessions. State the problem, not the product. |
| 0:20-1:10 | Live demo. Maya teaching Pip. Let Pip resist once. Let the silence sit. |
| 1:10-1:40 | The architecture diagram. Say the sycophancy problem out loud, cite that 66% to 40% drop, then show the executable malrule and the belief strip. |
| 1:40-2:05 | The refusal path. Pip not getting it, and the flag going to the tutor. |
| 2:05-2:30 | Parent card and tutor brief. Name the retention mechanic. |
| 2:30-2:40 | Same engine, three malrule libraries, three subjects. One slide. |

Record the demo screen capture first, separately, so a flaky API call doesn't cost you a
whole take. Voiceover after.

## Hours 11-12: submit

README at the repo root explaining the mechanic in 200 words. Deploy anywhere that gives a
public URL. Submit early, since the rules say entries are reviewed as they arrive.

## The two things that will kill this

1. **Pip caves.** If the model breaks character on the first push, the demo is dead. This
   is exactly why the answer comes from code and the release comes from a separate judge.
   Test the stubbornness before you build anything pretty.
2. **Voice latency.** 4 seconds of dead air on video feels like a minute. If round-trip is
   slow, cut to text input for the recording and mention voice as shipped-but-trimmed.
