# Mistakes

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Mistakes** (`S[lang].mis`, newest first, at most 50 per language): wrong answers to sentence and grammar questions (kinds `build`, `blank`, `gram`,
including story comprehension and travel reply questions) are recorded by `misTrack` (js/exercises.js, called from `onAnswer`; not during the placement quiz or test).
Each item stores a snapshot of the question; `misRebuild` turns it back into a question. `startMistakes` (js/ui.js, row "Mistakes" in `homePractise`) opens a
review session (`view.mis=true`) with up to 10 items. A wrong answer (including “I do not know”) repeats the question once at the end of the same session
(the rebuilt question has `again=true`, so it is not queued a second time). If the repeat is wrong too, the session can still finish and the item stays in
Mistakes for a later session. A correct answer removes the item. `mis` is synced inside `user_settings.data.per[lang]` (not as separate rows); on a conflict
the newer side wins as a whole list (last-write-wins).
