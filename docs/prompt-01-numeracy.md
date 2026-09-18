# Prompt 01: foundational arithmetic, the research, and what the game does with it

Nerdy's prompt: an interactive, gamified math experience for elementary students that makes
foundational arithmetic intuitive and engaging, with mechanics that encourage steady
progression and reward mastery of core numeracy.

The brief we're designing against, from the K-5 math-difficulties and dyscalculia
literature: CRA progression, explicit instruction with modelled thinking, subitizing and
part-part-whole training, and structured low-stakes games.

Here's what each one says, what the evidence is, and what it became in the build.

## 1. Concrete → Representational → Abstract

**Evidence.** Bouck, Satsangi and Park (2018) reviewed CRA for students with learning
disabilities and found it meets the bar for an evidence-based practice for basic operations,
subtraction and multiplication in particular. A 2025 meta-analytic review (Ebner, MacDonald,
Grekov and Aspiranti, *Learning Disabilities Research & Practice*) reports a large pooled
effect across single-case studies. The mechanism is the fade: the child starts with things
they can hold, moves to pictures of them, and ends at symbols, with the supports removed as
they stop needing them.

**In the game.** The three rounds *are* the CRA ladder, run in the direction the research
describes and then measured in reverse:

- Round 1 (abstract): Pip does the column algorithm on paper, wrongly. `43 − 27 = 24`.
- Round 2 (concrete, with talk): the child shows him with base-ten blocks on screen. To take
  7 ones from 3 ones you *have* to trade a ten. The blocks make the bug physically
  impossible, which is the whole point of the concrete stage. They explain out loud while
  they do it.
- Round 3 (abstract, alone): a fresh problem in symbols. The hint ladder is the CRA ladder in
  reverse: hint 1 shows the picture (tens and ones drawn), hint 2 opens the blocks. **Mastery
  is solving at the abstract level with zero concrete hints.** That's the progression number,
  and it's measured every session.

## 2. Explicit instruction and thinking out loud

**Evidence.** Gersten, Chard, Jayanthi, Baker, Morphy and Flojo (2009), *Review of Educational
Research*, a meta-analysis of 42 intervention studies for students with learning disabilities
in math. Explicit instruction and teaching heuristics gave the largest and most reliable
effects. **Student verbalization of their reasoning** was a coded component with a
significant positive effect, alongside visual representations and sequenced examples.

**In the game.** The child is the one who models thinking aloud, to Pip, who needs it. That's
the protégé effect (Chase et al. 2009, strongest for lower achievers) applied to the
component Gersten found matters. Pip's questions are the explicit-instruction moves in
reverse: "wait, why did you break that ten up?" forces the child to state the step. Immediate
corrective feedback comes from two places at once: the blocks (the count is right or it
isn't) and the judge (the explanation names the principle or it doesn't). Consistent
vocabulary is enforced in the rubric: *trade*, *ten*, *ones*.

## 3. Subitizing and part-part-whole

**Evidence.** Clements (1999) and Clements and Sarama's learning trajectories: perceptual
subitizing (seeing 3 without counting) and conceptual subitizing (seeing 7 as 5 and 2) are
foundational, trainable, and predictive of later arithmetic. Children with dyscalculia
characteristically count one by one where peers see the group.

**In the game.** A warm-up round called Flash. A dot pattern on a ten-frame appears for one
second and disappears. The child says the number, then says how they saw it ("five and
three"). Reaction time and accuracy are recorded; patterns grow as accuracy holds. That's
steady progression with a real mastery signal, and it takes 30 seconds.

## 4. Structured, low-stakes games

**Evidence.** Game contexts reduce math anxiety and increase practice volume; dice, dominoes
and ten-frames are the standard toolkit because they're quantity made visible. Math anxiety
affects roughly 17% of students and 77% of anxious students are normal-to-high achievers, so
low stakes matter more than points.

**In the game.** The stakes are Pip's. He's the one who's wrong, the child is the expert, and
the only score is whether he gets it. No streaks, no coins. Progress is a list of things Pip
no longer gets wrong and a hint count that goes down.

## The bug library for foundational arithmetic

Brown and Burton (1978) showed that most subtraction errors are one of about a dozen stable,
rule-governed procedures. The four in the prototype, all executable:

| Malrule | What Pip does | 43 − 27 / 38 + 25 |
|---|---|---|
| `sub_smaller_from_larger` | Subtracts the smaller digit from the larger in every column | 24 |
| `sub_borrow_no_decrement` | Trades a ten but forgets to reduce the tens | 26 |
| `add_drop_carry` | Adds the ones, writes the digit, drops the carry | 53 |
| `add_write_both_digits` | Writes the whole ones sum in the ones place | 513 |

Same engine as the fractions library: the malrule computes the wrong answer, the model only
voices it, the verifier matches what's on the worksheet against every candidate.

## What we measure, and why it's the right metric for the prompt

The prompt asks for "steady progression and reward mastery." Points measure taps. These
measure numeracy:

1. **Subitizing speed and accuracy** (Flash), growing pattern size.
2. **Concrete competence**: did the child trade correctly and land on the right count.
3. **Explanation quality** 0-3 against a rubric, judged from speech.
4. **Abstract transfer with support level**: fresh problem, solved alone, hints counted, where
   each hint is one step back down the CRA ladder.

Number 4 is the progression. A child who needed the blocks last week and needs only the
picture this week is moving up the ladder, and the tutor can see it.

## Sources

- [Gersten et al., Mathematics Instruction for Students With Learning Disabilities: A Meta-Analysis of Instructional Components (2009)](https://journals.sagepub.com/doi/10.3102/0034654309334431)
- [Bouck, Satsangi & Park, The CRA Approach for Students With Learning Disabilities: An Evidence-Based Practice Synthesis (2018)](https://journals.sagepub.com/doi/10.1177/0741932517721712)
- [Ebner et al., A Meta-Analytic Review of the CRA Math Approach (2025)](https://journals.sagepub.com/doi/10.1177/09388982241292299)
- [Brown & Burton, Diagnostic Models for Procedural Bugs in Basic Mathematical Skills (1978)](https://eric.ed.gov/?id=ED159036)
- [Lee & Corter, Diagnosis of Subtraction Bugs Using Bayesian Networks (2011)](https://journals.sagepub.com/doi/10.1177/0146621610377079)
- [Chase, Chin, Oppezzo & Schwartz, Teachable Agents and the Protégé Effect (2009)](https://aaalab.stanford.edu/assets/papers/2009/Protege_Effect_Teachable_Agents.pdf)
