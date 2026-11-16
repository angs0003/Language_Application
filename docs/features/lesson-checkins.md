# Lesson check-ins (New words step)

Update this file when the feature changes. Pull request 2 of plan B (stacked on the pull request for lesson recall).

**Structure** (`checkinSizes`, `buildCheckins`, `startLesson` in js/lessons.js): the New words step (step 0) is built as `v.items0`, a list of word cards `{k:"word",wi}` and check questions `{k:"check",q,wi,n,m}`.
1. Words are split into groups of at most 3, as equal as possible: 5 words become 3+2, 10 words become 3+3+2+2.
2. After the word cards of a group comes a check of one question per word of that group, in mixed order. From the second group on, each check adds 1 question on a word from an earlier group of the same lesson (label “Earlier word”).
3. Question types rotate over the whole lesson: recall (`mkRecall`, English meaning only; the learner types or says the reading), listen (“Listen. Which word did you hear?”), meaning (“What does this word mean?”). The first check always starts with a recall question.
4. A 5-word lesson has 11 items in step 0 (5 word cards and 6 check screens). Nothing is added beyond that.

**Behaviour**
1. Progress text: “Step 1 of 6: New words” and “Check: question N of M” (on a word card: “Word N of the number of words”). The bar uses the number of items, so it does not move backwards when a check opens.
2. Every question has “I do not know” and “Check answer”. Feedback appears only after Check answer, in the bottom panel (green or red), with characters, reading and meaning. Continue moves on; nothing moves by itself and there is no timer.
3. The recall question works as in the Quiz step, including “Say the word” and “I can’t speak right now” (`view.noSpeak`). `readQuestion` reads a check question aloud like a quiz question (not for recall).
4. Back works everywhere. Back from the first check question opens the last word card of its group. Back to an answered check question shows its answer and feedback again (design rule 9).
5. Check answers are practice only: they change no review data (`srs`) and are not part of the Summary. `checkinCount` counts an answer once (`q.upd`) into `view.ck` when Continue is pressed; this tally is not shown and not saved. Wrong check answers are not repeated at the end; the Quiz step asks every word again and repeats the wrong ones.

**Place** (see lesson-place.md): `resume.i` in step 0 is always a word index. A place on a check question is saved as the last word of its group, and continuing opens that word card. An older saved place (step 0, `i` 3) opens word 4.

Tests: tests/lesson-checkins.test.js. Screens in tests/phone/screens/lessons.js: “Lesson: check question”, “Lesson: check question with earlier word”.
