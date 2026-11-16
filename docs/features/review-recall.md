# Review recall (Practise review)

Update this file when the feature changes. Pull request 3 of plan B (recall questions also in the Practise review).

**Word questions** in `startMixed` (js/ui.js; Practise tab “Start practice” and “Practise anyway”) and in `startReview` (js/lessons.js; only when `recap` is false) come from `reviewQ(w,l,i)` (js/exercises.js):
1. Box (`S[l].srs[w].b`) 3 or higher: always a recall question (`mkRecall`).
2. Box 0 to 2: rotation by position `i%3`: recall, meaning, listen (about 1 in 3 recall).
The old “type the reading” question is no longer in the word rotation. It stays in kanji questions and elsewhere.

**Not changed:** kanji questions, My words questions in `startMixed`, the Recap session (`startReview(words,true)`), Sentences, Mistakes, Sounds, review timing, the speak question when Settings > Speaking questions is on (`startReview`, every 4th slot), the fill-the-blank question (every 4th word in `startReview`).

**Recall question:** as in docs/features/lesson-recall.md (English meaning only, typed reading or “Say the word”, “I do not know”, Check answer before the result). Answers use the existing `onAnswer` -> `srsSet` path: correct raises the box, wrong or “I do not know” sets box 1 and due now. No new progress field.

**“I can’t speak right now”:** `setNoSpeak(on)` also converts unanswered speak questions in `view.qs` when `view.s==="review"` (to recall or listen questions).

Tests: tests/review-recall.test.js. Screen in tests/phone/screens/practice.js: “Review: recall question”.
