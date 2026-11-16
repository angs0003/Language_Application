# Lesson recall (Quiz step)

Update this file when the feature changes. Pull request 1 of plan B; the check-ins inside New words are in docs/features/lesson-checkins.md, recall in the Practise review is in docs/features/review-recall.md.

**Quiz step of a lesson** (`buildQuiz(l,words,k,opts)` in js/exercise-types.js):
1. Match the pairs (3 or more words).
2. One question per lesson word, in mixed order: recall (about half), meaning, listen, fill the blank. No speak questions any more.
3. Up to 4 sentence questions (build, listen and build, build English), as before.
4. Up to 2 “Earlier word” questions (recall, listen or meaning; label “Earlier word”): words from `dueList(l)` that are not words of this lesson. Without due words there are none.
A lesson of 5 words has 10 to 12 questions, a lesson of 10 words about 15 to 17.

**Recall question** (`mkRecall`, a `type` question with `q.recall=true`; `qHTML` in js/exercises.js): shows only the English meaning (no characters, no reading). The learner types the reading (romaji or hiragana; pinyin without tones), checked with `readingMatch`. `recallMatch` also accepts the reading of another word with exactly the same English meaning. After the answer the feedback shows characters, reading and meaning (the `detail` line). “I do not know” and Check answer work as in every question.
The learner can also say the word (button “Say the word”, existing `startListen`; the first attempt is the one that counts). This option is offered only when speech recognition exists (`recallCanSpeak`, mode `recognize`), because the other speak modes play the word and would give the answer away. On iPhone it depends on Safari settings (CLAUDE.md section 11), so typing is always available.
**“I can’t speak right now”** (secondary link button under the question): `setNoSpeak(true)` sets `view.noSpeak`. This and all later recall questions in the lesson show typing only, and unanswered speak questions become listen or type questions. A link “I can speak now” clears the flag. The flag is part of the open lesson view only: no clock, no timer, not saved to progress or the database, gone when the lesson closes.

**Repeat** (`lessonRepeatStart` and `lessonMove` in js/lessons.js, `mkAgain` in js/exercises.js): when Continue is pressed on the last question, every question answered wrongly (including “I do not know”) is asked once more, at most 5, as a new question with `again=true` (same rule as Mistakes). Not repeated: speak questions, Match the pairs, and a wrong repeat. The line “N questions to repeat. The first answer counts for your review.” is shown above the first repeat; the progress text is “Repeat: question 1 of N”; the bar never moves backwards (`v.shown`). `misTrack` is unchanged: a sentence question wrong in the lesson stays in Mistakes even when its repeat is right.

**Summary** uses first answers only (questions without `again`): a word wrong first and right on the repeat is still wrong for review (`srsSet`, d=0). “Quiz result: X of Y correct” counts the lesson’s own questions. Due earlier words answered in the lesson are updated once at Summary (`v.saved`): correct goes to a longer interval, wrong is due again now. The line “Earlier words: X of Y correct. …” appears only when earlier words were asked.

Tests: tests/lesson-recall.test.js. Screens in tests/phone/screens.js: “Lesson: recall question”, “Lesson: quiz earlier word”, “Lesson: repeat question”.
