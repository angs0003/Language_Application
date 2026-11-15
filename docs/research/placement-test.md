# Placement test: research and proposal

Date: 2026-11-15. Author: researcher agent. No app files were changed.

## Answer in 3 lines

1. The current quiz is too long because it is a linear scan: 2 questions per theme from theme 1, so up to 248 questions (Chinese, 124 themes) or 458 (Japanese, 229 themes). A simulation of the current rules (my model, section "Simulation") gives a mean of about 126 questions (Chinese) and 226 (Japanese), and it places the learner about 53 and 105 themes too low on average.
2. Adaptive search over the ordered themes needs far fewer questions: published evidence says adaptive tests reach the same reliability with about half the items (about 70% confidence), and a simulated Bayesian search over the 124/229 themes ends in 9 to 12 questions on average, never more than 20, with a stated 90% range.
3. Recommendation: replace the linear scan with a Bayesian search over themes, at most 20 questions with the count always visible, "I do not know" as a first-class answer, a "Finish now" button on every question, and a result that says "about 90% sure your starting theme is between X and Y" and starts at the low end of that range.

## Findings

Each finding: source, kind of evidence, confidence that the claim holds for this app.

1. Duolingo (app) placement test is adaptive. It assumes a novice, starts with very simple items, makes items harder after correct answers, re-estimates skill after each answer, and at the end unlocks the skills it thinks the learner knows. Duolingo does not publish the number of questions, the stopping rule or the duration. Source: https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/ . Evidence: vendor documentation. Confidence 90% that it is adaptive; counts unknown.
2. Duolingo English Test (a separate exam) uses item response theory (IRT), Bayesian scoring and Thompson-sampling item selection, where the reward is the Fisher information of the item. Source: https://research.duolingo.com/papers/settles.tacl20.pdf . Evidence: peer-reviewed paper by the vendor. Confidence 85%. Relevance: the principle "ask the item that tells most about the learner" is what the proposal uses, in a simpler form.
3. Busuu: one adaptive test of about 5 minutes (older page: 10 minutes) covering vocabulary, grammar, listening and reading; later questions depend on earlier answers; can be retaken. No question count published. Sources: https://help.busuu.com/hc/en-us/articles/16526383831569-What-is-a-Placement-Test , https://blog.busuu.com/find-your-level/ . Evidence: vendor documentation. Confidence 70% (pages disagree on length and languages).
4. Babbel: placement quiz from the Home tab, retakeable, only for Spanish, French, Italian and German; a third-party review says fill-in-the-blank vocabulary and grammar. No count or duration published. Source: https://support.babbel.com/hc/articles/20202703767442 . Evidence: vendor documentation plus a review. Confidence 60%.
5. LingQ has no adaptive test as its main method: level is the count of "Known Words", and its test is described by staff as a rough estimate that is "not going to be as accurate" as the known-word count; users report large mismatches. Source: https://forum.lingq.com/t/is-there-a-way-to-test-fluency-in-lingq/284155 , https://lingq-support.groovehq.com/help/understanding-lingq-statistics . Evidence: vendor support and forum. Confidence 60%.
6. Memrise: no information on a placement test was found. Not used as evidence.
7. Adaptive tests need fewer items for the same precision: reviews report up to about 50% shorter tests. A simulation study found that under about 40 items, reliability estimates of adaptive tests are less stable and that a small fixed number of items is a weak stopping rule for guessing-prone (3-parameter) models. Sources: https://www.frontiersin.org/articles/10.3389/fpsyg.2018.00681/full (Seo and Jung 2018, empirical and simulation study); https://dergipark.org.tr/en/download/article-file/2234070 (simulation, citing Embretson and Reise 2000). Evidence: simulation studies, no single meta-analysis found. Confidence 70%. Consequence: a stopping rule based on a stated uncertainty (credible range width) plus a hard cap is better than a fixed count alone.
8. A staircase vocabulary test exists: STAIRS4WORDS (English, Dutch, German) moves up and down frequency bands and scores the last band answered correctly; yes/no format. Source: https://core.ac.uk/download/210964652.pdf (conference poster, as returned by search). Evidence: poster, preliminary. Confidence 50%. It supports the idea of searching ordered bands, not the specific accuracy.
9. Short vocabulary tests work as a measure of vocabulary size: LexTALE takes about 5 minutes and correlates substantially with English proficiency and better than self-ratings. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3356522 (Lemhoefer and Broersma 2012, controlled validation study). Confidence 80%. A 2023 partial replication found only low to moderate correlation with global proficiency, so treat it as vocabulary size, not total skill. Source: https://research.polyu.edu.hk/en/publications/the-lextale-as-a-measure-of-l2-global-proficiency-a-cautionary-ta/ . Confidence 75%. Consequence: this app tests vocabulary position only, so the result must be worded as "words you know", not "your level".
10. Guessing inflates vocabulary scores. Yes/no tests add non-words to detect over-claiming; false alarms correlate above .80 with guessing on real words (Zhang, Liu and Ai 2019). A 2020 review (Stoeckel, McLean and Nation) lists guessing and test strategies as one of three sources of inaccuracy in size tests. Sources: https://vuw-web.matrix.squiz.cloud/__data/assets/pdf_file/0005/1881968/2020-Stoeckel-McLean-Nation.pdf ; https://eld.bl.uk/catalog/100094602931_0x000001 . Evidence: review and study. Confidence 80%.
11. An "I do not know" option reduces guessing but also discourages partial knowledge (Zhang 2013, TESOL Quarterly, Vocabulary Size Test). Source: https://metatoc.com/papers/21412-the-i-don-t-know-option-in-the-vocabulary-size-test . Evidence: controlled study (abstract only read). Confidence 70%. Consequence: with a 4-option question, treat "I do not know" as "not known", and treat a wrong answer as "not known" too; do not subtract points.
12. The standard 3-parameter model uses one fixed guessing floor for all learners, a questionable fit when an "I do not know" option is present. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC5063855 and related search results. Evidence: review. Confidence 55%. Consequence: use a simple model with an explicit guess rate (0.25 for 4 options) only for answers that are not "I do not know".
13. Length and breaks for ADHD and anxious learners: evidence is thin and mostly not about autism. A study of about 2,700 US grade-8 students with disabilities (NAEP 2017) found extended time helped; breaks alone were linked to lower scores and lower engagement. Source: https://digitalpromise.org/2025/07/29/rethinking-testing-accommodations-to-effectively-support-learners/ . Evidence: observational study. Confidence 60%. A report on a 2025 article says extended time helps students with anxiety more than students with ADHD alone. Source: https://www.edweek.org/teaching-learning/does-extended-time-on-tests-actually-help-students-with-adhd/2025/10 . Evidence: news report on a study. Confidence 55%. A language-testing opinion piece argues fixed-length tests cause fatigue for neurodivergent test takers and proposes shorter adaptive tests (opinion, not empirical; no autism data). I found no controlled study of test length for autistic learners. Confidence that "short, known length, no clock, can stop" helps: about 65% (inference from anxiety evidence plus the app's own design rules).

## What the app does today

Files: `js/lessons.js` lines 101 to 122 (`startPlacement`, `screenPlace`); `js/ui.js` line 90 (card "Placement quiz" with "Start placement quiz" and "Skip and start at Theme 1"); `js/exercises.js` line 5 (`mkQ`).

1. `startPlacement` builds one "meaning" question (4 options, 25% guess rate) for word index 0 and word index 3 of every theme, in order. Same two words every time.
2. The quiz stops when 3 answers in a row are incorrect, or at the last question. Header text: "question N of up to M".
3. The result counts the themes from theme 1 whose 2 questions were both correct, stopping at the first theme with an error. The learner is placed at the next theme. Those themes are marked learned (box 3, due spread over 0 to 3 days, `js/lessons.js` line 113).
4. "I do not know" is a normal wrong answer. The result is only a prefix: one slip in an early theme ends the result there, even though the quiz keeps asking more questions (wasted effort after the first failed theme).
5. "Skip and start at Theme 1" exists on the Learn card. There is no way to stop the quiz and keep a partial result: the Exit panel leaves without a result.
6. Not stored: no confidence, no retake limit, no use of PARTS or LEVELS.

Note: the owner reports 254 questions; the code gives 2 x theme count, so 248 (Chinese) and 458 (Japanese). I did not verify why the owner saw 254.

## Simulation (my own model, not published evidence)

Script: scratchpad `sim.js` (not in the repo). Model: the learner knows themes before position s and answers them correctly with 95% probability; for later themes the learner answers "I do not know" with probability 0.7, otherwise guesses with 25% success. 4000 simulated learners per row, s uniform from 0 to N.

| Rule | Themes | Mean questions | 95th percentile | Mean error (themes) | Placed more than 10 themes too high |
|---|---|---|---|---|---|
| Current linear scan | 124 | 126 | 239 | 53 too low | 0% |
| Current linear scan | 229 | 226 | 434 | 105 too low | 0% |
| Bayesian search, cap 20 | 124 | 9.4 | 20 | 3.8 absolute | 1.4% |
| Bayesian search, cap 20 | 229 | 10.5 | 20 | 4.1 absolute | 1.5% |
| Same, learner never says "I do not know" (guesses) | 124 / 229 | 16.5 / 17.7 | 20 | 6.6 / 8.4 absolute | 3.1% / 4.0% |
| Same, 10% slip rate on known themes | 124 / 229 | 10.2 / 11.7 | 20 | 4.0 / 4.6 absolute | 1.5% / 1.8% |

The 90% range contained the true position in 93% to 95% of runs. The estimate used the 10th percentile of the posterior (conservative), so the average error is a few themes too low, which is the safe direction. Confidence in these numbers for real learners: about 50% (the model is simple: real themes are not perfectly ordered by difficulty, and real slips are not independent).

## Gaps

1. No fast way to stop and keep a result.
2. No confidence statement; the result sounds exact.
3. Fixed words (index 0 and 3), so a retake repeats the same questions.
4. Distractors come from the whole word list (`mkQ`), which are easy to eliminate, so recognition questions overestimate knowledge a little.
5. Skipped themes are marked box 3 with due dates spread over only 4 days. For a learner placed at theme 100, about 1000 words become due within 4 days. I did not check whether the review session caps this; it may be a flood (not ADHD-friendly). Please verify.
6. The result is theme-only; PARTS and LEVELS (`lv`, `t`) are not shown, so the learner cannot see "Level 3, Part 2".

## Ranked proposals

### 1. Bayesian search over themes (replaces the linear scan)

Problem: 126 to 458 questions, placement far too low, wasted questions after the first miss.
Evidence: findings 2, 7, 8; simulation above.
Change (in `startPlacement` and `screenPlace`, `js/lessons.js`):
1. Keep a probability for each possible starting position 0..N (N = number of themes; "position s" means themes before s are known).
2. Start with a flat probability. Ask about the theme at the middle (median) of the current probabilities; the first question is therefore near theme 62 (Chinese) or 114 (Japanese).
3. For a question at theme t: P(correct) = 0.95 if t is before s (known); P(correct) = 0.25 x (1 - share of "I do not know" answers) if t is at or after s. In the simulation the unknown-case value was 0.075 and the known-case value was 0.95. After the answer, update all probabilities (Bayes rule). A correct answer moves the estimate up; "I do not know" or a wrong answer moves it down.
4. Stop when the 90% range is 8 themes wide or less (at least 6 questions asked), or at 20 questions, or when the learner presses "Finish now".
5. Choose a random word of the theme each time (not fixed indexes) and never repeat a word in the same session.
6. Result start theme = the 10th percentile of the probabilities (conservative). Placing too low costs a short repeat; placing too high skips unknown words.
Screen: existing placement screen. Effort: medium (about 60 lines; new unit test for the update rule and for the cap). Design rules touched: 8 (no timer: none added), 9 (literal feedback, "I do not know", Check answer, Back), 2 (one primary action stays).

### 2. Question types and number of probes

Evidence: findings 9, 10, 11, 12.
Change:
1. Questions 1 to about 12: "meaning" (4 options, "I do not know" visible, existing component).
2. Roughly every third question: "listen" (audio, choose meaning) so that a learner who knows sounds but not characters is not placed too low; both use the same probability update. For the first version, "meaning" only is acceptable.
3. Last 2 questions (only when the range is still wider than 8): the "type" question if it checks the English meaning or the reading in a way a beginner can do; recall has no 25% guess floor, so one correct answer is stronger evidence. Open question 3 below.
4. Not used: "build" and "blank" (they need grammar and several words; they confuse vocabulary position), and no non-word items (a nonsense word in a language the learner is just starting would be confusing and unkind).
Effort: small to medium. Rules touched: none new.

### 3. Always-visible length, stop button, confidence statement

Evidence: finding 13 (about 65%), finding 7.
Change:
1. Header: "Question 5 of about 12, at most 20" (the "about" number is the expected remaining questions from the current range; the cap is exact). Remove the "Incorrect answers in a row" line (it frames mistakes as a countdown to failure).
2. Intro card before the quiz, literal: "This quiz has at most 20 questions and takes about 5 minutes. There is no timer. You can press Finish now at any time. Choose I do not know instead of guessing. Skipped themes are marked as learned; you can change this later."
3. "Finish now" as a link-style button (style `link`, so the primary action rule holds) on every question; it uses the result so far, with a wider range.
4. Result text: "Your starting point is Theme 41, [title] (Level 2, Part 3). I am about 90% sure that your correct starting point is between Theme 41 and Theme 48. Themes 1 to 40 are marked as learned and added to your review list. You can change this: Start earlier / Start later." One primary button "Save and go to home" (as today).
5. A manual "Choose my starting theme" picker (list of Levels/Parts, then themes) as the alternative to the quiz, since self-ratings are less valid than a test (finding 9) but are fast and give control.
Effort: small. Rules touched: 2, 8, 9, 11 (curly quotes).

### 4. Skipped themes: review timing

Evidence: finding 7 of "Gaps" (own analysis; no external source).
Change: keep "marked as learned with review timing" as today (box 3), but spread due dates by theme distance from the start: themes closest to the start (last 10) due in 1 to 3 days, the rest spread over 2 to 6 weeks, so that no more than a set number of words become due per day. Needs the review session cap checked first.
Effort: small. Rules touched: none. Needs the data-engineer if sync fields change (they do not).

### 5. Retake and Settings

Change: "Retake placement quiz" in Settings, which can only move the start up (never un-learn marked themes), and an undo for 7 days after the first result is out of scope here.
Effort: small. Rules touched: 1 (Settings is not a tab; fine).

## Open questions for the owner (one at a time)

1. Is a cap of 20 questions and a result "about 90% sure, between X and Y" acceptable, or do you want a smaller cap (for example 15, with a wider range)?
2. Should the result start at the low end of the range (safer, a few themes of repeat) or at the middle?
3. Does the existing "type" exercise ask for something a beginner can do (English meaning typed from the word)? I did not read `js/exercises.js` beyond `mkQ`. If not, the first version uses "meaning" and "listen" only.
4. Is it acceptable to add a manual "Choose my starting theme" picker, in the same card as "Skip and start at Theme 1"?
5. Should skipped words be due in 1 to 3 days (as now) or spread over weeks (proposal 4)?

## Sources used (16)

1. https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/
2. https://research.duolingo.com/papers/settles.tacl20.pdf
3. https://help.busuu.com/hc/en-us/articles/16526383831569-What-is-a-Placement-Test
4. https://blog.busuu.com/find-your-level/
5. https://support.babbel.com/hc/articles/20202703767442
6. https://forum.lingq.com/t/is-there-a-way-to-test-fluency-in-lingq/284155
7. https://lingq-support.groovehq.com/help/understanding-lingq-statistics
8. https://pmc.ncbi.nlm.nih.gov/articles/PMC3356522
9. https://research.polyu.edu.hk/en/publications/the-lextale-as-a-measure-of-l2-global-proficiency-a-cautionary-ta/
10. https://vuw-web.matrix.squiz.cloud/__data/assets/pdf_file/0005/1881968/2020-Stoeckel-McLean-Nation.pdf
11. https://eld.bl.uk/catalog/100094602931_0x000001
12. https://metatoc.com/papers/21412-the-i-don-t-know-option-in-the-vocabulary-size-test
13. https://www.frontiersin.org/articles/10.3389/fpsyg.2018.00681/full
14. https://dergipark.org.tr/en/download/article-file/2234070
15. https://core.ac.uk/download/210964652.pdf
16. https://digitalpromise.org/2025/07/29/rethinking-testing-accommodations-to-effectively-support-learners/ and https://www.edweek.org/teaching-learning/does-extended-time-on-tests-actually-help-students-with-adhd/2025/10

Limits: some pages were read only as search summaries or abstracts; Memrise, and exact question counts for Duolingo, Busuu and Babbel, could not be found.
