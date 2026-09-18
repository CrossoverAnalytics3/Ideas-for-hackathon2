# The verbal layer

Your point, sharpened: a tutoring session is 60 minutes of talking. Every tool a kid uses
between sessions is silent tapping. The channel changes, so the practice doesn't transfer.

Understudy keeps the channel. There is no answer box anywhere in the product. The
microphone is the only input.

## Why speaking does the work, not just carries it

**Typing gives you a result. Speaking gives you the path.** A text field collects `2/5`.
A microphone collects "so I take the one and the one, that's two, and then... hang on."

Four separate bodies of research back this up.

**The production effect.** MacLeod, Gopie, Hourihan, Neary and Ozubko (2010) found that
merely reading words aloud instead of silently improves later recognition memory by
**10-20%**. Articulation makes the memory trace distinctive. The act of producing sound
does work that silent reading doesn't, before you get to any of the harder effects.

**The self-explanation effect.** Chi's work: learners who generate explanations outlearn
learners who read the same explanation. Generating is the active ingredient, and speaking
is the lowest-friction way to generate.

**Math talk has classroom evidence.** Number Talks and Accountable Talk are built entirely
on kids explaining reasoning out loud. Students' participation in classroom math
conversations predicts achievement, and achievement improved in units where teachers
deliberately used talk moves compared with direct instruction. This is standard elementary
practice, and it disappears the second a kid picks up a tablet.

**Disfluency is a confidence readout.** This is the one that turns your idea into a
feature. Children produce **more fillers, more hedges, and longer speech onsets on
incorrect trials and on low-confidence trials.** Verbal disfluency predicted both answer
accuracy and children's own confidence reports (*Do Young Children Use Verbal Disfluency as
a Cue to Their Own Confidence?*, PMC11883146).

How a kid says it carries as much signal as what they say. A correct answer delivered after
a 4-second pause, two "ums" and an "I think maybe" is a different mastery state from the
same answer delivered instantly and flat. Every quiz in edtech scores those identically.

## Two speech modes, deliberately separated

They're cognitively different, and treating them the same is where products go wrong.

**Think-aloud (solving).** The kid narrates while working an unfamiliar problem. Messy,
allowed to be wrong, no scoring.

**Teach-aloud (explaining to Pip).** The kid produces a coherent explanation for an
audience that will push back. Much harder, and much more productive.

The think-aloud literature has a real caveat: verbalizing while solving adds cognitive
load and can slow or degrade performance, especially for kids still building language
fluency. So **we don't force think-aloud during hard novel work.** Teach-aloud lands in the
spaced-review slot, days after the kid already learned the thing. The load is affordable
there, because retrieval and articulation are the whole point of that session.

Saying this out loud in the demo signals that you read the literature rather than just
liking the idea of voice.

## The fluency signal, or: the tell

Alongside correctness, score the delivery.

| Measured | What it picks up |
|---|---|
| Speech onset latency | Retrieval difficulty |
| Filled-pause rate (um, uh) | Planning load, uncertainty |
| Hedge rate (I think, maybe, kinda, I guess) | Low confidence |
| Self-repairs and restarts | Monitoring and revision |
| Terminal rise on a statement | Asking rather than asserting |

Cross it with correctness and you get four states, not two:

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

**The top-right quadrant is the product.** A kid who is correct and hesitant passes every
assessment on the market and then fails the unit test three weeks later. No answer box can
see that state. A microphone can.

Show that grid in the demo video next to a real waveform with the pauses marked. That is
the single clearest argument for why this has to be spoken, and it takes 15 seconds.

## The trick that makes the ASR problem survivable

Children's speech recognition is genuinely hard. Word error rates run **4 to 8 times worse
than adult speech**, worse the younger the child, because of vocal tract development,
shifting formants and unstable pronunciation. It's the reason Amira Learning is worth what
it's worth. Recent work has cut it down (a tuned Whisper hit **9.2% WER** on the MyST child
speech corpus, a 38% relative improvement), but a tenth of the words still come back wrong.

Here's the part that falls out of the design for free.

**Pip is a confused 9-year-old.** When the recognizer garbles something, Pip says "wait,
say that again, I didn't get it." A tutor persona asking you to repeat yourself feels
broken. A younger kid asking feels completely natural, and it's pedagogically useful:
re-explaining is exactly what you want the kid doing anyway.

The persona absorbs the error rate. Every other voice product in this space pays for ASR
failures with broken immersion. This one converts them into a second attempt at the
explanation.

Same trick on ambiguity. Low-confidence transcript, uncertain intent, unparseable math
phrasing: Pip asks a clarifying question in character. "You said make the bottoms the same?
Same as what?" That's a scaffolding move and an error handler at once.

## What this does for Nerdy's business

**It rehearses the paid hour.** A kid who can already articulate their reasoning walks into
the live session ready to work, instead of spending 15 minutes being coaxed into speaking.
Nerdy sells the hour. Anything that raises the yield on that hour raises perceived value,
which is the churn lever.

**It closes the modality gap.** Session: spoken. Between sessions: currently silent.
Understudy keeps it spoken end to end, so the tutor's work and the homework practice are
the same skill.

**It makes the parent artifact land.** A progress bar is a number. A 40-second clip of your
own kid explaining why you can't add denominators is something a parent forwards to a
grandparent. That's the anti-churn object, and it only exists because of voice.

**It produces a mastery estimate Nerdy can't buy.** Weekly, per skill, per kid: can they
explain it, and how fluently. Fed back to the human tutor before the next session. Live
plus AI, actually closing the loop.

## Where this sits against Synthesis Tutor

Worth being straight about, because a judge will raise it.

Synthesis Tutor is voice-guided AI math for ages 5-11, $119/yr for a family, Socratic, and
kids speak their reasoning aloud. Voice-first math practice for elementary kids exists and
is well reviewed.

The role is reversed here. In Synthesis the AI is the expert and voice is how it assesses
the child. In Understudy the child is the expert and voice is the only way the task can
happen at all, because you cannot teach somebody silently. Speaking is load-bearing here.

Two things Synthesis structurally can't do:

1. **The malrule comes from a real session with a real human tutor.** Synthesis has no
   tutors. Nerdy has 40,000+.
2. **The fluency signal goes back to that human.** The output is a briefing for the person
   the family is already paying.

Say both in the video. Naming your closest competitor and drawing the line cleanly reads as
confidence, and every judge on that panel already knows Synthesis exists.

## Build notes

- **Push to talk, not always on.** Kitchens are loud and siblings exist.
- **Stream both directions.** Budget under 1.5s from end-of-speech to Pip's first syllable.
  Dead air on a demo video feels like a minute.
- **Keep the raw audio.** The fluency features come from timing and the audio, not just the
  transcript. Onset latency and pause duration are lost if you only keep text.
- **Pip's voice should be a kid's voice.** An adult-sounding tutee breaks the whole frame.
- **Let the kid see the transcript** as it comes in, so a misrecognition is visibly the
  machine's fault rather than theirs.
- **Never make a kid repeat more than twice.** Third failure, Pip gives up cheerfully and
  the item goes to the tutor brief.
