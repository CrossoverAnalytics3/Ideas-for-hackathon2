# Understudy

**Kids don't learn it until they can teach it. So make them teach it, to an AI that's stuck on their own old mistake.**

Submission concept for the [Nerdy AI Hackathon Challenge](https://hackathon.nerdy.com/).
Fits prompt 1 (elementary math), and the same engine runs prompts 2 and 3.

---

## The one-sentence version

Understudy takes the specific wrong rule a kid used last Tuesday, pins it inside an AI
character, and three days later asks the kid to teach that character out of it.

The kid talks. The character stays wrong until the explanation is actually right.

---

## Why this, for Nerdy, right now

Nerdy said the quiet part out loud on the Q2 2026 call. Learning Memberships sat at
29,100 as of June 30, down 5% year over year. Revenue was $43.3M, down 4%. They wound
down Varsity Tutors for Schools and exited First Tutors UK to put everything into
consumer. And the product bet they named for getting back to growth is **Study Plan**,
described as the framework to drive daily active usage and deliver value *between* live
tutoring sessions.

That's the whole problem in one line. A family buys a weekly session. The tutor is
brilliant for 60 minutes. Then there are 167 hours where nothing happens, the kid forgets,
the parent sees no evidence, and in month 4 they cancel.

A Study Plan is a to-do list. To-do lists don't hold a 10-year-old.

Understudy is a daily loop built from the one asset nobody else has: **the record of what
this specific kid got wrong, in a real session, with a real human who caught it.** Khanmigo
has no tutor. Duolingo has no tutor. Amira has no tutor. Nerdy has 40,000 of them, and
right now that signal evaporates the moment the session ends.

## What a session looks like

> **Understudy (Pip, age 9):** Okay so 1/2 + 1/3. Tops make 2, bottoms make 5. It's 2/5.
>
> **Maya (the kid, age 11):** That's wrong.
>
> **Pip:** But 2 + 3 is 5. I did it right.
>
> **Maya:** You can't just add the bottoms. The bottom says how big the pieces are.
>
> **Pip:** Okay. So... 2/5?
>
> **Maya:** No. Look, half a pizza plus a third of a pizza. That's more than half. But 2/5
> is *less* than half. So it can't be right.
>
> **Pip:** ...oh. Oh that's weird. So how do I make the pieces the same size?

Two weeks earlier, Maya wrote 2/5 on her tutor's whiteboard.

## The mechanic, precisely

1. **Catch the malrule.** Brown and Burton showed in 1978 that most wrong answers are
   consistent procedures with one broken step. A kid writing 1/2 + 1/3 = 2/5 is running
   whole-number addition on fractions, correctly, on the wrong object. We tag which broken
   procedure fired rather than logging a red X.
2. **Wait.** The item goes into a spacing queue keyed to forgetting, not to the calendar.
3. **Spawn the Understudy.** Days later a character appears holding that exact malrule, on
   a problem the kid has never seen. Same bug, new clothes.
4. **The kid teaches, out loud.** Voice in, free-form. Multiple choice can't express an
   explanation, so there isn't any.
5. **The Understudy resists, honestly.** It reapplies the malrule. It asks why. It gets it
   wrong a second time in a way the malrule predicts. Telling it "just flip the second one"
   does nothing, because procedure-parroting isn't understanding.
6. **It only breaks when the explanation names the principle.** A separate judge scores the
   kid's reasoning and decides whether to release the belief.
7. **The teaching is the artifact.** Parent gets a 40-second clip of their kid explaining
   fractions. Tutor gets a pre-session brief: "Maya holds fraction addition solidly now.
   Still can't explain why common denominators work. Start there."

That last step is the retention fix. Churn happens when a parent can't tell if the money is
doing anything. Here they watch their kid teach.

## The hard part, which is also the pitch

Making a language model stay wrong is genuinely difficult, and 2026 research says so
plainly. The misconception-faithfulness work (arXiv 2605.12748) found LLM student
simulators collapse into sycophantic problem solving: they abandon the misconception the
moment the tutor pushes, because helpfulness training is pulling the other way. MalruleLib
(ACL 2026) measured the same wall from the other side. Across nine models from 4B to 120B,
accuracy on predicting a student's next answer under a known misconception fell from 66% on
plain problem solving to **40%** when the same bug was rephrased into a new template.

If the AI caves the second the kid says "no that's wrong," the entire product is a toy.

**So we take the answer away from the model.** Each malrule is executable code. A plain
function computes what a kid holding that bug would write, and the model's only job is to
say it in a 9-year-old's voice and defend it in character. The belief is pinned outside the
weights, where sycophancy can't reach it.

Releasing the pin is a separate call: a judge model scores the kid's explanation against a
rubric for that specific misconception, and only a passing score flips the state. Two
models, one piece of code, no drift.

```
  student work ──► malrule classifier ──► spacing queue
                                              │
                                    (3 days later)
                                              │
                                              ▼
                 ┌────────────────────────────────────┐
                 │  malrule.execute(new_problem)      │  ← deterministic. cannot cave.
                 │          ↓ wrong answer            │
                 │  voice model: say it in character  │
                 └────────────────────────────────────┘
                                              │
                        kid explains (voice) ─┤
                                              ▼
                        judge model: does this explanation
                        actually name the principle?
                              │              │
                            no│              │yes
                              ▼              ▼
                    stay wrong,        release pin,
                    ask again          Pip gets it
                              │              │
                              ▼              ▼
                       tutor brief      parent clip
```

Show that diagram in the demo video and every engineer on the panel knows you understood
the actual problem.

## Why a kid does this voluntarily

Chase, Chin, Oppezzo and Schwartz (2009) ran it. Students teaching a digital agent put in
more effort and learned more than students doing identical work for themselves, and the
gap was **largest for lower-achieving kids**. Teaching triggers effort, self-monitoring,
and a willingness to go back and fix errors that studying alone doesn't.

Chi's self-explanation work points the same direction. Producing the explanation is where
the learning happens, and almost every product on the market has the kid consuming one
instead.

There's a bonus that matters commercially: **you cannot cheat at teaching.** There's no
answer to photograph. Chegg's business died on that distinction.

## Why the existing teachable-agent attempts flopped

The 2025-26 literature keeps naming the same failure: an LLM tutee knows everything, so
kids don't believe the teaching is real and disengage. The agent's ignorance has to be
specific and stable, and generic prompting won't hold it.

Pinning the belief to an executable malrule *drawn from this kid's own work* fixes both
halves. The ignorance is stable because it's code. And it's motivating because the kid
recognizes it. That's the part nobody has shipped.

## One engine, all three hackathon prompts

| Prompt | Malrule the Understudy holds | Kid's job |
|---|---|---|
| Math (elementary) | `add_numerators_and_denominators` | Explain why piece size matters |
| Literacy | Reads the passage literally, misses the inference | Walk it through the evidence |
| Language | Overgeneralises the regular past tense, says "I goed" | Explain when the rule stops |

Same pipeline, three malrule libraries. Worth saying in the video: this is an engine, and
the demo happens to point it at fractions.

## How it plugs into Nerdy's stack

- **Study Plan** gets a daily activity that a kid opens without being nagged.
- **Live sessions** get a warm start. The tutor sees exactly what survived and what didn't.
- **Parents** get evidence, which is the actual churn lever.
- **Assessment** gets a signal Nerdy can't buy anywhere: a transcript of what a kid can and
  can't explain, graded, weekly. That's a far better mastery estimate than a quiz score.

Nothing here needs schools, which matters, since Nerdy just exited that business.

---

## Status

Idea and spec. Build plan in [`docs/build-plan.md`](docs/build-plan.md), evidence and
sources in [`docs/research.md`](docs/research.md).
