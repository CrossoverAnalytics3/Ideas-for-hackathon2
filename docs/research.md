# Evidence behind the idea

Everything below was gathered on Sept 18, 2026. It's the material the pitch stands on.

## The hackathon

[hackathon.nerdy.com](https://hackathon.nerdy.com/). Free, public, up to $10,000.
Submissions opened Aug 27 and close **Friday Sept 18, 2026 at 11:59 PM CDT**. Entry is a
project link plus a 2-3 minute demo video. A panel of Nerdy engineers reviews every entry,
finalists present live to Nerdy leadership, and strong builders get pulled into
conversations about AI Product Engineer roles.

Three prompts, or bring your own:

1. **Math.** Interactive, gamified math for elementary students. Foundational arithmetic,
   mechanics that reward steady progression and mastery of core numeracy.
2. **Language.** Structured mobile experience for acquiring a language through spaced
   repetition or daily practice, with "a strong grasp of pedagogical design."
3. **Literacy.** Reading fluency, comprehension and vocabulary for young learners through
   interactive storytelling or challenge-based gameplay.

Read the fourth option carefully: "The three above are suggestions, not a shortlist. Build
whatever you want, so long as it is a tool that genuinely helps someone learn."

The recurring word across all three prompts is pedagogy. They're telling you they'll reward
a defensible learning mechanic over a slick UI.

## What Nerdy is actually dealing with

From the Q2 2026 earnings call and release (Aug 2026):

| Metric | Value |
|---|---|
| Learning Memberships (June 30, 2026) | 29,100, down 5% YoY |
| Q2 revenue | $43.3M, down 4% YoY |
| Consumer share of revenue | 84% ($36.5M) |
| ARPM | $366, up 5% YoY |
| FY2026 guidance | cut to $168M-$175M from $180M-$190M |
| Headcount | down 34% YoY |

Strategic moves: wound down Varsity Tutors for Schools, exited First Tutors UK, roughly
$11M of annual fixed cost out. Consumer is the whole company now. The telesales funnel is
being replaced with self-service digital checkout.

The stated path back to growth is **retention**, and the named product vehicle is **Study
Plan**, described as the central software framework to drive daily active usage and provide
value between live tutoring sessions. Study Plan combines a learner's goals, available
time, mastered skills and recommended activities.

Cohn on the call talked about threading together "all these different modalities of
learning that allow for us to extend beyond tutoring... much deeper, much more holistic
relationships with [learners] that span subjects, that span product modalities, that span
semesters."

Management expects active member growth to turn positive by end of 2026.

**Read as a product brief:** they need something a learner opens on a Tuesday, that carries
signal from the last session into the next one, and that gives a paying parent a reason to
not cancel.

## The pedagogy

**Protégé effect.** Chase, Chin, Oppezzo and Schwartz, *Teachable Agents and the Protégé
Effect: Increasing the Effort Towards Learning*, Journal of Science Education and
Technology, 2009. Students working with Betty's Brain who believed they were teaching an
agent spent more time on learning activities and learned more than students doing identical
work for themselves. Effects were most pronounced for lower-achieving children. A follow-up
verbal-protocol study with 5th graders identified three mechanisms: greater effort, better
self-monitoring, and more willingness to correct errors.

**Self-explanation effect.** Chi's work: learners who generate explanations of worked steps
outlearn those who read the same material. Generation beats consumption, and nearly every
AI tutoring product on the market puts the kid on the consuming side.

**Misconceptions are procedures, not noise.** Brown and Burton (1978), *Diagnostic Models
for Procedural Bugs in Basic Mathematics Skills*, and Brown and VanLehn's Repair Theory
(1980). Systematic student errors are small structured edits to a correct procedure. The
diagnostic models explain errors, predict future mistakes, and can generate diagnostic
tests. A kid computing 1/2 + 1/3 = 2/5 is applying whole-number addition consistently to
the wrong object (also documented as "whole number bias," Behr et al. 1984, Ni and
Zhou 2005).

That's the load-bearing idea. If a wrong answer is a rule, the rule is executable, and an
executable rule is a belief you can pin inside a character.

## The technical problem, and why solving it is the pitch

**LLM student simulators are sycophantic.** *Simulating Students or Sycophantic Problem
Solving? On Misconception Faithfulness of LLM Simulators* (arXiv 2605.12748, May 2026).
Simulators are usually scored on output similarity to real students rather than on whether
they hold a coherent misconception through an interaction. The paper introduces
"misconception faithfulness": does the simulator maintain a misconception-driven belief
state and update it only when feedback addresses the underlying misconception? Helpfulness
training pulls hard the other way.

**And they're bad at it even when they try.** *MalruleLib: Large-Scale Executable
Misconception Reasoning with Step Traces* (ACL 2026 / arXiv 2601.03217). 101 malrules over
498 parameterized problem templates, drawn from 67 learning-science and math-education
sources, with paired traces for correct and malrule-consistent reasoning. Their benchmark
task is to infer a misconception from one worked mistake and predict the student's next
answer under a rephrased template. Across nine models from 4B to 120B, accuracy fell from
**66% on direct problem solving to 40% on cross-template misconception prediction.**

**Persona drift is measured and real.** *LLM-Based Educational Simulation: Evaluating
Temporal Student Persona Stability* (arXiv 2605.06307) found within-conversation drift in
unscripted dialogue, and found that explicit task scripting eliminated it. Which is the
design hint: constrain hard, outside the model.

**Teachable agents have already failed on exactly this.** The 2024-26 literature (CHI 2024
*Teach AI How to Code*; AIED 2026 work on pedagogically steered teachable agents) keeps
naming the same wall: an LLM tutee's expansive knowledge discourages learners from teaching
it. The agent has to be specifically and stably ignorant, and prompting alone won't hold
that.

**Putting an executable malrule under the character answers all four papers at once.** The
model never picks an answer, so it can't cave. The ignorance is narrow and stable because
it's a function. And the release condition is a separate scored judgment rather than a vibe.

## Why it has to be spoken

**The production effect.** MacLeod, Gopie, Hourihan, Neary and Ozubko (2010), reviewed in
MacLeod & Bodner, *The Production Effect in Memory*, Current Directions in Psychological
Science (2017). Reading words aloud rather than silently improves later recognition memory
by **10-20%**, comparable in size to the generation effect. Production makes items
distinctive at encoding, which helps retrieval later. Articulation is doing work before you
get to any of the harder effects.

**Disfluency indexes confidence, in children specifically.** *Do Young Children Use Verbal
Disfluency as a Cue to Their Own Confidence?* (PMC11883146). Children produced **more
fillers, more hedges and longer speech onsets on incorrect trials and on low-confidence
trials**, and verbal disfluency predicted both answer accuracy and the children's own
confidence reports. Related: filled pauses co-occur with discourse-novel and hard-to-retrieve
words, and inserting filled pauses lowers listeners' perceived confidence in the speaker,
most strongly mid-utterance.

This is the empirical basis for scoring delivery alongside content, and for the
correct-but-hesitant "fragile" state that no answer box can detect.

**Math talk has classroom evidence.** Number Talks and Accountable Talk / talk moves are
built on students explaining reasoning aloud. Students' participation in classroom math
conversations predicts achievement; teachers' encouragement and follow-up on productive
talk increased engagement, which fed through to learning; and achievement improved in units
where teachers deliberately used talk moves versus primarily direct instruction. Standard
elementary practice, and it vanishes the moment a kid picks up a tablet.

**The honest caveat on think-aloud.** Verbalizing while solving adds cognitive load and can
slow or degrade performance, notably for speakers still building language fluency. So
teach-aloud belongs in the spaced-review slot, days after the kid learned the material,
rather than during hard novel problem solving. This is a design constraint the literature
hands you.

## Children's ASR: the real risk

Children's speech recognition error rates run **4 to 8 times worse than adult speech**
(other sources put it at 2-5x), and get worse the younger the child. Causes are
physiological and developmental: vocal tract growth shifting formant frequencies, unstable
pronunciation, higher acoustic variability, plus dialectal variation.

Recent progress is real. A tuned Whisper reached **9.2% WER on the MyST child speech
corpus**, a 38% relative reduction and the lowest reported at the time. A 2026 children's
ASR competition saw top entrants cut the best existing child-speech model's error rate by
more than half, converging on fine-tuned Qwen3-ASR-1.7B. Fine-tuned Whisper-medium hit
5.54% WER on clean JASMIN data and 70.37% on noisy DART data, which is the honest range.

**Design answer:** the tutee persona absorbs the errors. A confused 9-year-old asking "wait,
say that again?" is in character and pedagogically useful. A tutor persona doing the same
thing reads as broken software.

## Competitive read

| Product | Owns | Missing |
|---|---|---|
| Amira Learning | Early reading, 1,800+ districts, listens to kids read aloud | Schools-only, reading-only, no human tutor loop |
| Read with Ello | At-home decodable reading, ages 4-9 | Same, narrow band |
| Khanmigo | Price and reach, $15/student/year, cross-subject | No human tutor, kid is always the one being taught |
| MATHia (Carnegie Learning) | Serious math cognitive tutor | School sale, no consumer daily loop |
| Prodigy | Elementary math engagement | Game loop weakly coupled to the math |
| Synthesis Tutor | Voice-first Socratic math, ages 5-11, $119/yr family | AI is the expert, child is the student; no human tutor, no signal handoff |
| Duolingo | Habit and retention mechanics | Facts and phrases, not reasoning or explanation |

K-12 AI tutor market is roughly $2.75B in 2026.

Synthesis is the closest thing and the one a judge will name. It proves voice-first
elementary math works as a product, which is helpful. It keeps the AI in the expert chair,
so the child never has to produce an explanation for an audience, and there's no human
tutor on the other end to hand a signal to.

Nobody in that table has both a live human expert and a record of what this specific kid
got wrong with that expert. Nerdy does. No standalone commercial product is running the
teach-back loop, which the teachable-agent literature confirms.

## Sources

- [Nerdy AI Hackathon Challenge](https://hackathon.nerdy.com/)
- [Nerdy (NRDY) Q2 2026 Earnings Call Transcript, Motley Fool](https://www.fool.com/earnings/call-transcripts/2026/08/13/nerdy-nrdy-q2-2026-earnings-call-transcript/)
- [Nerdy Announces Second Quarter 2026 Financial Results, Nasdaq](https://www.nasdaq.com/press-release/nerdy-announces-second-quarter-2026-financial-results-2026-08-06)
- [Nerdy Inc (NRDY) Q2 2026 Earnings Call Highlights, GuruFocus](https://www.gurufocus.com/news/9015087/nerdy-inc-nrdy-q2-2026-earnings-call-highlights-strategic-exits-and-aidriven-innovation-pave-the-way-for-growth)
- [Nerdy Q1 2026 Shareholder Letter](https://s206.q4cdn.com/118732467/files/doc_financials/2026/q1/Nerdy-1Q2026-Shareholder-Letter.pdf)
- [Varsity Tutors Live+AI launch, EdTech Innovation Hub](https://www.edtechinnovationhub.com/news/varsity-tutors-launches-liveai-to-link-human-tutoring-with-always-on-ai)
- [AI Product Engineer, Careers @ Nerdy](https://careers.nerdy.com/job-posts/aipe)
- [Chase et al., Teachable Agents and the Protégé Effect (2009), Stanford AAALab PDF](https://aaalab.stanford.edu/assets/papers/2009/Protege_Effect_Teachable_Agents.pdf)
- [Brown & Burton, Diagnostic Models for Procedural Bugs (1977), ERIC](https://eric.ed.gov/?id=ED159036)
- [MalruleLib, ACL 2026](https://aclanthology.org/2026.acl-long.690/)
- [Simulating Students or Sycophantic Problem Solving?, arXiv 2605.12748](https://arxiv.org/abs/2605.12748)
- [LLM-Based Educational Simulation: Temporal Student Persona Stability, arXiv 2605.06307](https://arxiv.org/html/2605.06307)
- [Teach AI How to Code: LLMs as Teachable Agents, CHI 2024](https://dl.acm.org/doi/10.1145/3613904.3642349)
- [Exploring the Impact of an LLM-Powered Teachable Agent, arXiv 2504.00636](https://arxiv.org/pdf/2504.00636)
- [Best AI Reading Tutors for Kids 2026, Luca](https://luca.ai/blog/best-ai-reading-tutors)
- [MacLeod & Bodner, The Production Effect in Memory (2017)](https://journals.sagepub.com/doi/10.1177/0963721417691356)
- [MacLeod et al., The Production Effect: Delineation of a Phenomenon (2010)](https://uwaterloo.ca/memory-attention-cognition-lab/sites/default/files/uploads/files/jep10.pdf)
- [Do Young Children Use Verbal Disfluency as a Cue to Their Own Confidence?](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11883146/)
- [Corley & Stewart, Hesitation Disfluencies in Spontaneous Speech: The Meaning of um (2008)](https://compass.onlinelibrary.wiley.com/doi/10.1111/j.1749-818X.2008.00068.x)
- [Voice assistant technology continues to underperform on children's speech, JASA Express Letters](https://pubs.aip.org/asa/jel/article/5/3/035201/3338215/Voice-assistant-technology-continues-to)
- [ASR Tuned for Child Speech in the Classroom, ICASSP 2024](https://www.colorado.edu/research/ai-institute/sites/default/files/attached-files/childasr_icassp24_camera-ready_0.pdf)
- [Closing the Child Speech Recognition Gap, The Learning Agency](https://the-learning-agency.com/guides-resources/closing-the-child-speech-recognition-gap-evidence-limitations-and-paths-forward/)
- [On Top of Pasketti: Children's ASR Challenge, DrivenData](https://www.drivendata.org/competitions/group/childrens-asr-competition/)
- [Synthesis Tutor](https://www.synthesis.com/tutor)
- [Promoting rich discussions in mathematics classrooms, Teaching and Teacher Education](https://www.sciencedirect.com/science/article/abs/pii/S0742051X22000026)
