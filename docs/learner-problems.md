# What's actually going wrong for learners

Researched Sept 18, 2026. The question was what problems learners have, so the product
answers something real rather than something we found interesting.

Five problems came back. They look separate. They aren't.

---

## 1. Learners can't tell when they've learned something

This is the oldest finding here and the one everything else rests on.

Koriat and Bjork showed that people use **ease of processing as a proxy for learning**.
When material reads smoothly, or the answer is sitting right there on the page, learners
conclude they've understood it. The condition that feels most fluent reliably produces the
most overconfidence and the worst outcomes.

Watching a worked solution is the worst offender. Students who watch an animated worked
example recognise every step as it happens, feel the click, and conclude they could do it
themselves. They usually can't.

Bjork's framing: learners confuse **retrieval strength** (can I follow this right now) with
**storage strength** (will this be there on Thursday). They optimize for the first one
because it feels better.

**Nothing in edtech measures this.** A quiz score is a single bit. It can't separate a kid
who knows it cold from a kid who just watched the video 10 minutes ago.

## 2. AI is making problem 1 dramatically worse, and fast

This is the newest evidence and it's the most important thing we found.

**Students use AI to extract answers, not to learn.** *Your Students Don't Use LLMs Like You
Wish They Did* (arXiv 2604.23486, April 2026) analysed 12,650 messages across 500
conversations in four courses. Educators build conversational tutors for sustained learning
dialogue. Students paste the assignment question in verbatim and take the solution.
**59% of an entire semester's interactions happened during one exam week.** Crisis mode, not
study.

**The standard AI tutor design actively produces the illusion.** *Confidence Without
Competence in AI-Assisted Knowledge Work* (arXiv 2604.09444, 85 participants) tested
interaction designs against a normal single-agent chatbot. The chatbot baseline produced
**the highest perceived understanding and the lowest objective learning of any condition.**

Read that twice. The obvious build, a friendly AI tutor that answers well, is the one
condition measured to make students feel smartest while learning least.

**And it compounds by age.** Cognitive-offloading research (n=666, plus a separate n=350
study) finds heavier AI use correlates with lower critical-thinking scores, mediated by
offloading. Participants over 46 showed higher critical thinking and lower AI reliance.
Ages 17 to 25 showed the reverse. As one summary put it: **adults lose skills to AI,
children never build them.** The neural pathways for constructing an argument don't atrophy
in a 12-year-old, because they were never laid down.

**Strategic read:** most hackathon submissions this weekend will be a chat tutor with a
mascot. There's now a 2026 paper measuring that exact design as the worst of four.

## 3. Learners barely speak, and the ones who need to speak most speak least

**Class time.** Hattie's work puts teacher talk at 70-80% of class time on average, and his
own data at 89%. Run the arithmetic on a 50-minute lesson with 25 kids:

```
  80% teacher talk → 10 min of student talk → 24 seconds per student
  89% teacher talk →  5.5 min              → 13 seconds per student
```

That's a derived estimate, not a measured one, and it's the right order of magnitude.
**Under half a minute of talking per lesson.** The recommended ratio is the inverse: 70-80%
student talk.

**Help-seeking.** Ryan and Pintrich's finding is that **the students who need help most seek
it least.** The driver is a social-demonstration-avoid goal: avoiding looking stupid in
front of peers. Kids unsure of themselves cognitively or socially feel most threatened by
asking.

**Language classrooms are worse.** Silence becomes what the research calls an attractor
state: the more a learner uses silence to dodge the thing they fear, the more firmly the
anxiety holds. Three documented silent behaviours are short responses, switching to the
first language, and not talking at all.

So the learner who most needs to articulate their reasoning is the one structurally least
likely to get to do it, in class or at home.

## 4. The content gaps are narrow, known, and they compound

These aren't diffuse. They're a short list of specific things, and missing them cascades
for a decade.

**Fractions.** A longitudinal study across UK and US datasets found that **fraction
knowledge at age 10 predicted algebra and overall math achievement at 16, over and above
general math ability, IQ and socioeconomic status.** In a nationally representative survey
of 1,000 Algebra 1 teachers, fractions were rated the **second greatest barrier** to
mastering algebra, behind only word problems. The 2008 National Math Advisory Panel called
fraction difficulty pervasive and a major obstacle to all further progress.

The Brown and Burton line explains why it happens: a kid writing 1/2 + 1/3 = 2/5 is running
whole-number addition correctly on the wrong object. The error is a rule, not a slip.

**Reading fluency.** **70% of children who fall behind in word-reading fluency in grade 1
are still behind in grade 8.** Without fluency, all the working memory goes into decoding
and none is left for comprehension. Roughly two thirds of US fourth graders score below
proficient in reading, and the 2022 average matched 1992 exactly.

**Middle school math is the acute zone.** 44% of surveyed educators said the majority of
their middle-school students face severe or very severe math challenges, the highest of any
grade band.

**Product consequence:** a small, well-chosen set of misconceptions covers a large share of
the damage. You do not need 10,000 skills. You need the 50 that gate everything after them.

## 5. Practice at home dies in week one

**Duolingo attrition: 64% at four months, 87% at one year.** Industry-wide, language-app
dropout hits **80% in the first week.** Duolingo is the best retention product in consumer
edtech and those are its numbers.

Streaks and points got monthly churn down from 47% to 28% in Western markets, which is a
real achievement and also the ceiling of what extrinsic reward buys you.

Nerdy's own version of this: Learning Memberships at 29,100, down 5% year over year, with
retention named as the path back to growth.

**Screen time is now the top obstacle to student success worldwide**, and 42% of educators
say students' ability to focus has declined over five years. The attention you're competing
for keeps getting more expensive.

---

## The convergence

Every one of those five is the same failure wearing different clothes.

Watching a worked example. Rereading notes. Tapping a multiple choice. Pasting a question
into ChatGPT. Tapping through a Duolingo lesson. All **consumption**, and consumption is
exactly what generates the illusion of competence, because consumption feels fluent.

The fix the research keeps pointing at is **production**. Generate the explanation. Retrieve
it cold. Say it out loud to someone who will push back.

That's what the tutoring hour is, and that's precisely the hour the learner can't afford
seven days a week.

## What this validates in Understudy

| Problem | How the mechanic answers it |
|---|---|
| Illusion of competence | Teaching is production. You can't feel fluent while failing to convince Pip. |
| AI producing confident ignorance | The learner is the expert. The AI never hands over an answer, because it doesn't have one. |
| Answer-extraction | There's no answer to extract. Pasting a question in gets you nothing. |
| 24 seconds of talk per lesson | Voice-only, daily, no answer box. |
| Help-seeking avoidance | Nobody is watching, and the AI is *below* you in status. That's the whole point of a protégé. |
| Fractions as the gate | Fractions are the first malrule library. Directly on the strongest predictor in the literature. |
| Home practice dying | Motivation is social, not extrinsic. Chase 2009 found the protégé relationship drives effort, strongest in lower achievers. |

The one we should say out loud in the video: **the obvious submission is the measured-worst
design.** We have the citation.

## What this challenges, and it's a real problem

**Math anxiety breaks a clean reading of the fluency signal.**

Math anxiety affects roughly 17% of students across 63 education systems in PISA data. Here's
the part that matters: in a study of nearly 1,800 elementary and middle schoolers, **77% of
the students experiencing math anxiety were normal-to-high achievers.**

So hesitation in speech is ambiguous. Long onset, hedges and restarts might mean shaky
knowledge. They might equally mean an anxious kid who knows it perfectly well. Our
"correct but hesitant = fragile" quadrant would mislabel that kid and re-queue work they
don't need, which is the fastest way to make an anxious child hate the product.

**The fix, and it makes the product better:** score fluency **against the learner's own
baseline, not an absolute threshold.** Every kid gets a personal speaking profile from their
first week. An anxious kid who's always slow reads as fluent when they're at their own
normal. The signal we actually want is the delta, and a per-learner baseline is more honest
than a global cutoff anyway.

Say this in the demo. Naming the confound and showing you handled it reads better than a
grid that pretends to be clean.

## Other things worth knowing

- **Loneliness is the top K-12 wellness concern in 2026.** Younger kids report feeling
  excluded; older ones feel isolated inside friend groups. A character who needs you is not
  a trivial thing for a lonely 9-year-old. Worth one sentence, and not worth overclaiming.
- **Educators name motivation and engagement above content** as what they need help with.
  75% flag behaviour, 70% engagement.
- **Structured silence has evidence behind it** in language learning: it improves listening
  comprehension, raises later speaking performance and lowers anxiety. So don't punish a
  pause. Let Pip wait.

## Sources

- [Koriat & Bjork, Illusions of competence in monitoring one's knowledge during study](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Koriat_Bjork_2006_MC.pdf)
- [Your Students Don't Use LLMs Like You Wish They Did, arXiv 2604.23486](https://arxiv.org/abs/2604.23486)
- [Confidence Without Competence in AI-Assisted Knowledge Work, arXiv 2604.09444](https://arxiv.org/abs/2604.09444)
- [When Thinking Is Outsourced: Cognitive Offloading and Critical Thinking](https://pmc.ncbi.nlm.nih.gov/articles/PMC13413235/)
- [AI, cognitive offloading and implications for education, UTS 2026](https://www.uts.edu.au/news/2026/03/experts-warn-unstructured-ai-use-in-schools-risks-cognitive-atrophy/contentassets/ai-cognitive-offloading-and-implications-for-education.pdf)
- [Adults Lose Skills to AI. Children Never Build Them., Psychology Today](https://www.psychologytoday.com/us/blog/the-algorithmic-mind/202603/adults-lose-skills-to-ai-children-never-build-them)
- [Ryan & Pintrich, Avoiding Seeking Help in the Classroom: Who and Why?](https://link.springer.com/article/10.1023/A:1009013420053)
- [How Much Should Teachers Talk in the Classroom?, Education Week](https://www.edweek.org/teaching-learning/how-much-should-teachers-talk-in-the-classroom-much-less-some-say/2019/12)
- ['The Silence Kills Me': Silence as a Trigger of Speaking-Related Anxiety](https://link.springer.com/article/10.1007/s42321-022-00119-4)
- [Predicting and Addressing Fractions Difficulties, University of Delaware](https://www.education.udel.edu/2016/01/30/fractions-difficulties/)
- [Fractions Scuttle Many Students' Math Ambitions, Education Week, May 2026](https://www.edweek.org/teaching-learning/fractions-scuttle-many-students-math-ambitions-new-models-can-clear-the-way/2026/05)
- [Why is learning fraction and decimal arithmetic so difficult?, Siegler et al.](https://www.sciencedirect.com/science/article/abs/pii/S0273229715000362)
- [Hiding In Plain Sight: Complex Decoding Challenges for Older Readers, EdTrust](https://edtrust.org/blog/how-complex-decoding-challenges-can-block-comprehension-for-older-readers/)
- [The Reading Crisis, Stern Center](https://sterncenter.org/the-reading-crisis/)
- [Middle and High School Students' Math Struggles, Education Week, May 2026](https://www.edweek.org/teaching-learning/elementary-math-has-been-in-focus-but-middle-and-high-school-students-struggles-are-daunting/2026/05)
- [L2 grit and age as predictors of attrition in mobile-assisted language learning](https://www.sciencedirect.com/science/article/pii/S1041608025000809)
- [Duolingo's user retention hits all-time high, CX Dive](https://www.customerexperiencedive.com/news/duolingos-user-retention-hits-all-time-high-as-app-boosts-stickiness/827499/)
- [Disentangling individual and contextual effects of math anxiety, PNAS](https://www.pnas.org/doi/10.1073/pnas.2115855119)
- [High math anxiety and lower achievement across 90 countries, meta-analysis 2026](https://pubmed.ncbi.nlm.nih.gov/42024317/)
- [Screen Time Emerges as Top Obstacle to Student Success Worldwide](https://www.nasdaq.com/press-release/screen-time-emerges-top-obstacle-student-success-worldwide-2026-07-29)
- [K12 wellness in 2026, TimelyCare](https://timelycare.com/blog/what-over-1-million-student-interactions-activities-reveal-about-k12-wellness-in-2026/)
