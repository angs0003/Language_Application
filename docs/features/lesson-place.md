# Lesson place

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Lesson place** (`S[lang].resume` = `{ti, words[], title, step, i, u}`; `lessonSave`, `lessonResumeFor`, `lessonResumeText`, `startLesson(words,title,repeat,fresh)` in js/lessons.js): moving inside a lesson saves the place (not for repeat lessons; a place at the first word is cleared; a place in the Quiz step is saved as the start of the quiz, because quiz questions are generated each time).
`startLesson` continues a matching saved place unless `fresh` is true. The Summary step and "Start from the beginning" clear it. The Learn card then says "Continue lesson". Synced inside `user_settings.data.per[lang]` like `mis` (last-write-wins, no SQL change).
Back on the first word of a lesson leaves the lesson; Back on the first question of a review session, test or placement quiz opens the same "Exit now?" panel as the X button.
In the New words step `resume.i` is always a WORD index (not the position in the list of word cards and check questions, `view.items0`). A place on a check question is saved as the last word of its group, and Continue lesson opens that word card. A place saved before the check-ins existed (step 0, `i` 3) opens word 4. See lesson-checkins.md.
