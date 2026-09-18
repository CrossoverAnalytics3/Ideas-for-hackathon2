# The on-ramp: photograph the graded work

Credit where it's due. This came from a practitioner, and it fixes the weakest part of the
concept.

## The hole it fills

Until now the answer to "where does the malrule come from?" was "the live tutor session."
That's true in a Nerdy deployment and useless everywhere else. It needs session recordings,
transcripts and backend access we don't have, and it means the product can't do anything for
a brand new learner on day one.

**A parent photographs the graded worksheet.** That's the whole intake.

It's already in the house. It's already marked. The red pen is ground truth, sitting on the
kitchen table in every home in the country, and right now it goes in the recycling.

## The loop, complete

```
  1  PHOTO      parent snaps the returned quiz or homework
        │
  2  DIAGNOSE   which malrule produced these exact wrong digits?
        │       (constrained match, then verified by running the code)
        │
  3  DRILL      a few generated problems on that malrule. low pressure.
        │       relearn it while the correction is fresh.
        │
        ├──── 3 days ────┐
        │                ▼
  4  TEACH      Pip holds the malrule. The learner talks him out of it.
        │       This is the test, and it can't be faked.
        │
  5  RECORD     per-misconception history. cleared, open, regressed.
        │
        └──► tutor brief before the next session · parent's progress view
```

Steps 3 and 4 are deliberately separated. The think-aloud research says verbalizing while
solving something hard adds cognitive load, so **drill first while it's fresh, teach later
from memory.** Practice and proof are different jobs on different days.

## Why this is the right on-ramp

**Zero cold start.** Most learning apps open on an empty profile and ask a kid to take a
placement test. This one opens on work the kid already did, already got wrong, and already
had marked. The first session is personalized before the learner has done anything.

**The parent is the one who acts, and the parent is the buyer.** A parent with a pile of
graded worksheets and no idea what to do with them is the exact person Nerdy is trying to
keep. Giving them a use for that pile is a retention mechanic on its own.

**It sidesteps the cheating frame entirely.** Photomath and Gauth get pointed at an unsolved
problem to produce an answer, which is why teachers hate them. This gets pointed at
already-graded work, after the fact, usually by an adult. Different intent, different moment,
no possible exam-time misuse.

**It generates the signal Nerdy can't buy.** Weekly, per learner, per skill: here's what they
got wrong, here's the rule behind it, here's whether they can explain their way out of it
now. Hand it to the human tutor before Thursday.

## The technical risk, which is the same risk we already solved

Vision models are good at grading handwritten math and bad at reading it. In one 2026
evaluation, **87% of the best model's errors were transcription failures rather than wrong
judgment.** The model understood the rubric and misread the page.

And there's a specific, named, much worse failure. *When VLMs "Fix" Students* (arXiv
2604.22774) documents **over-correction**: vision-language models silently repair student
errors while transcribing, because they're trained to output correct mathematics. Show one a
page that says `1/2 + 1/3 = 2/5` and it may confidently return `5/6`.

Sit with that. The single thing this product depends on, reading a child's mistake faithfully,
is the documented failure mode of the tool that reads it. It's the same sycophancy that makes
LLM tutees cave, showing up at the other end of the pipeline.

**Same fix, same principle: don't let the model decide.**

Ask a constrained question instead of an open one. Not "transcribe this page," but "which of
these 101 malrules, applied to this problem, produces what's written here?" The model matches
against a closed set instead of generating freely.

Then verify it in code:

```python
candidates = [r for r in MALRULES if r.applies_to(problem)]
predicted  = {r.id: r.execute(problem) for r in candidates}
# the vision model proposed "2/5"; which rule actually makes 2/5?
match = [rid for rid, val in predicted.items() if val == vision_reading]
```

If exactly one malrule produces the digits the model read, confidence is high. If none does,
the reading is probably an over-correction and we ask the parent to confirm. **The malrule
library is an error-correcting code for the OCR.**

That's worth 20 seconds of the demo video on its own. The same deterministic library
constrains the model at the input and at the output. One idea, both ends of the system.

## On "engaging games"

The suggestion was games generated from the weak areas. Half of that is right and the other
half needs care.

**Right:** generated practice targeted at the specific malrule is step 3, and it belongs
there. Fresh, varied problems that hunt the same bug in different clothes.

**Careful:** points, coins and streaks bolted on top would undercut the pitch. Chase's 2009
result is that the protégé relationship itself drives effort, hardest for lower achievers. The
progression is Pip getting smarter and the misconception list getting shorter. Real stakes
beat fake ones.

So: drills generate, the teach-back is the game, and Pip is the progress bar.

## Where this stands against what's already shipping

Photo-grading apps exist and it would be dishonest to claim otherwise. Gradulo lets a parent
upload a worksheet and marks it in seconds, showing what went wrong and how to explain the
fix. Snap2Grade grades from a photo. Lirno scans homework and saves corrections.

Every one of them treats the photo as a one-off. Snap, get feedback, done. Nothing persists.

Four things happen here that don't happen there:

1. The error gets a **stable identity** that survives across weeks and across problems, because
   it's a malrule and not a wrong answer.
2. It comes back **days later** on the forgetting curve, wearing different clothes.
3. The learner has to **teach it out loud**, which is the only test that can't be faked.
4. The record goes to **a human tutor** the family is already paying.

The photo is the on-ramp. The loop is the product.

## One thing to get right

A child's graded schoolwork can carry their full name, their teacher's comments, sometimes
other kids' names on a shared page. Strip identifiers on device, send the working and not the
header, don't retain the image after the malrule is extracted.

Say this in the submission in one sentence. A panel evaluating a consumer product for
children will notice whether you thought about it.

## Sources

- [When VLMs "Fix" Students: Over-Correction in Multi-line Handwritten Math OCR, arXiv 2604.22774](https://arxiv.org/html/2604.22774v2)
- [Automated Grading of Handwritten Mathematics Using Vision-Capable LLMs, arXiv 2605.19043](https://arxiv.org/abs/2605.19043)
- [Can MLLMs Read Students' Minds? Multimodal Error Analysis in Handwritten Math, arXiv 2603.24961](https://arxiv.org/html/2603.24961.pdf)
- [Automated Assessment of Handwritten Math Problems, LAK26](https://dl.acm.org/doi/10.1145/3785022.3785038)
- [Gradulo, Check My Homework](https://gradulo.com/check-my-work)
- [Cheating with the Photomath app, Khan Academy community](https://support.khanacademy.org/hc/en-us/community/posts/115000409307-Cheating-with-the-Photomath-app)
