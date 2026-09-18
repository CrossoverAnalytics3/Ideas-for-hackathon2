# Understudy

**Kids don't learn it until they can say it out loud. So make them teach it, out loud, to an AI that's stuck on their own old mistake.**

Submission concept for the [Nerdy AI Hackathon Challenge](https://hackathon.nerdy.com/).
Fits prompt 1 (elementary math), and the same engine runs prompts 2 and 3.

---

## The one-sentence version

A parent photographs the graded worksheet. Understudy reads the wrong *rule* behind the wrong
answer, pins it inside an AI character, and three days later asks the kid to teach that
character out of it.

Out loud. There's no answer box anywhere in the product. The character stays wrong until
the spoken explanation is actually right.

```
  PHOTO ──► DIAGNOSE ──► DRILL ──(3 days)──► TEACH ──► tutor brief · parent clip
  graded     which        practice            talk Pip
  homework   malrule?     while fresh         out of it
```

The red pen is ground truth, sitting on a kitchen table in every house in the country, and
right now it goes in the recycling. Full design in [`docs/intake.md`](docs/intake.md).

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

And there's a second gap underneath it that nobody talks about. **The session is 60 minutes
of talking.** The tutor explains, the kid answers back, both of them think out loud at each
other. Then the week starts and every tool the kid touches is silent tapping. The channel
changes, so the practice doesn't transfer. Understudy keeps it spoken end to end.

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

0. **Start from work that already exists.** A parent photographs the returned quiz. No
   placement test, no empty profile, no waiting for a tutor session to mine. The first
   session is personalized before the learner has done anything.
1. **Catch the malrule.** Brown and Burton showed in 1978 that most wrong answers are
   consistent procedures with one broken step. A kid writing 1/2 + 1/3 = 2/5 is running
   whole-number addition on fractions, correctly, on the wrong object. We tag which broken
   procedure fired rather than logging a red X.
2. **Wait.** The item goes into a spacing queue keyed to forgetting, not to the calendar.
3. **Spawn the Understudy.** Days later a character appears holding that exact malrule, on
   a problem the kid has never seen. Same bug, new clothes.
4. **The kid teaches, out loud.** Voice in, free-form, and it's the only input there is.
   Reading words aloud instead of silently improves recall by 10-20% on its own (the
   production effect). Producing an explanation for a listener who will push back does far
   more than that.
5. **The Understudy resists, honestly.** It reapplies the malrule. It asks why. It gets it
   wrong a second time in a way the malrule predicts. Telling it "just flip the second one"
   does nothing, because procedure-parroting isn't understanding.
6. **It only breaks when the explanation names the principle.** A separate judge scores the
   kid's reasoning and decides whether to release the belief.
7. **Score how it was said, not only what was said.** Pauses, "um"s, hedges, restarts,
   uptalk. Children produce more fillers, more hedges and longer speech onsets on incorrect
   and low-confidence trials, and that disfluency predicts both accuracy and their own
   confidence. So we grade delivery alongside content.
8. **The teaching is the artifact.** Parent gets a 40-second clip of their kid explaining
   fractions. Tutor gets a pre-session brief: "Maya holds fraction addition solidly now.
   Still can't explain why common denominators work. Start there."

That last step is the retention fix. Churn happens when a parent can't tell if the money is
doing anything. Here they watch their kid teach.

## The quadrant that justifies the microphone

Correctness alone gives you two states. Correctness crossed with delivery gives you four.

```
                    FLUENT                        HESITANT
            ┌───────────────────────┬───────────────────────────┐
            │  MASTERED             │  FRAGILE                  │
   CORRECT  │  space it far out     │  looks like mastery on    │
            │                       │  any quiz. it isn't.      │
            │                       │  re-queue in 2 days.      │
            ├───────────────────────┼───────────────────────────┤
            │  CONFIDENTLY WRONG    │  HONESTLY STUCK           │
     WRONG  │  entrenched malrule.  │  normal. just teach it.   │
            │  flag the tutor now.  │                           │
            └───────────────────────┴───────────────────────────┘
```

Top right is the whole argument. A kid who's correct but hesitant passes every assessment
on the market, then fails the unit test three weeks later. A text field can't see that
state. A microphone can.

Full design in [`docs/voice-layer.md`](docs/voice-layer.md).

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

## Reading the mistake is harder than reading the page

Vision models grade handwritten math well and read it badly. In a 2026 evaluation, **87% of
the best model's errors were transcription failures** rather than wrong judgment. Worse,
*When VLMs "Fix" Students* (arXiv 2604.22774) documents **over-correction**: the model
silently repairs a student's error while transcribing it, because it's trained to output
correct mathematics. Show it `1/2 + 1/3 = 2/5` and it may hand back `5/6`.

The one thing this product needs, reading a child's mistake faithfully, is the documented
failure mode of the tool that reads it. Same sycophancy as the tutee, at the other end of the
pipe.

Same fix. Ask a closed question instead of an open one: which of these 101 malrules, applied
to this problem, produces what's on the page? Then verify in code by running each candidate
and checking which one makes those digits. **The malrule library is an error-correcting code
for the OCR.**

One deterministic library constrains the model at the input and at the output. That's the
system story.

## The third hard part, and the trick that dissolves it

Children's speech recognition runs **4 to 8 times worse** than adult speech, worse the
younger the child. Tuned models have closed a lot of it (9.2% WER on the MyST child corpus,
a 38% relative gain), and a tenth of the words still come back wrong.

Every voice learning product pays for that with broken immersion. This one doesn't, because
**Pip is a confused 9-year-old.** When the recognizer garbles something, Pip says "wait,
say that again, I didn't get it." A tutor persona asking you to repeat yourself feels like
a bug. A younger kid asking feels like a conversation, and re-explaining is exactly what
you wanted anyway.

The persona absorbs the error rate and converts it into a second rep.

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

## The citation that reframes the whole submission

*Confidence Without Competence in AI-Assisted Knowledge Work* (arXiv 2604.09444, 2026)
tested four interaction designs with 85 participants. The plain single-agent chatbot
baseline produced **the highest perceived understanding and the lowest objective learning of
any condition tested.**

A companion study of 12,650 real student messages found the same thing from the usage side:
educators build conversational tutors for learning dialogue, students paste the assignment in
and take the answer, and 59% of a whole semester's interactions land in one exam week.

Most submissions this weekend will be a chat tutor with a mascot. There is now a 2026 paper
measuring that design as the worst of four. Understudy inverts it: the learner is the expert,
and the AI has no answer to hand over. Full evidence in
[`docs/learner-problems.md`](docs/learner-problems.md).

## On Synthesis Tutor, before a judge brings it up

Synthesis Tutor is voice-first AI math for ages 5-11, Socratic, kids speak their reasoning
aloud, $119/yr per family, well reviewed. Voice-first elementary math already exists.

The role is reversed here. Synthesis puts the AI in the expert chair and uses voice to
assess the child. Understudy puts the child in the expert chair, where speaking is the only
way the task can happen at all, because teaching someone silently isn't a thing.

Two things it structurally can't match: the malrule comes from a real session with a real
human tutor, and the fluency signal goes back to that human before the next one. Synthesis
has no tutors. Nerdy has 40,000+.

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

**Built.** The working app is in [`app/`](app/): `cd app && npm install && npm run dev` runs
the whole loop with zero keys (scripted Pip); add `ANTHROPIC_API_KEY` for the live model.
Engine unit tests and a headless end-to-end smoke test pass.

Concept and spec:

- [`docs/intake.md`](docs/intake.md) the photo on-ramp, the over-correction risk, and what already ships
- [`docs/learner-problems.md`](docs/learner-problems.md) what's actually going wrong for learners, and what it validates or breaks
- [`docs/voice-layer.md`](docs/voice-layer.md) the speech design, the fluency signal, the ASR strategy
- [`docs/build-plan.md`](docs/build-plan.md) 12-hour scope and demo-video shot list
- [`docs/research.md`](docs/research.md) evidence, numbers and sources
