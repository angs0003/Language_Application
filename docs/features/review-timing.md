# Review timing

Update this file when the feature changes.

Code: `INTERVAL`, `HARD`, `gapDays`, `srsStep`, `srsSet` in js/core.js; `kSet` in js/kanji.js; `onAnswer` (js/exercises.js) and `gradeCard` (js/listen.js) call `srsStep`.

1. Boxes 0 to 5 with `INTERVAL=[0,1,2,4,8,16]` days. Entry fields: `b` box, `d` due time, `u` last change, `lp` lapses (count of times the word was forgotten).
2. Wrong answer: box 1, due now. `lp` rises by 1, except when the entry is already in box 1 and due now (two wrong answers in a row count once).
3. Correct answer when due: the box rises by 1 (maximum 5); `d = now + gapDays(e) * DAY`.
4. `gapDays(e)`: the table gap of the new box. When `lp >= HARD.lapses` (2), the gap is `max(1, round(gap * HARD.factor))` (factor 0.5): a hard word comes back in half the time, never sooner than 1 day.
5. Correct answer before the due date (Practise anyway, My words practice, flashcards): no change. Exception: `srsStep(e,ok,learn)` with `learn=2` (kana and kanji, through `kSet`): below box `learn` a correct answer always raises the box, so a new kana or kanji reaches box 2 ("learned") after 2 correct practices.
6. `srsSet(l,w,ok)` keeps its signature and uses `learn=0` (words).
7. Progress field `lp`: srs entries, saved entries, `S.ja.kana`, `S.ja.kanji`. `normalize()` deletes `lp` unless it is a whole number of 0 or more. Sync: columns `lapses` (word, kana, kanji rows) and `saved_lapses` (saved entry of a word row) in `word_progress`; a row without the columns reads as 0.
8. Visible text: the My words "Practice finished" card says "Words you find hard come back sooner."

Tests: tests/review-timing.test.js.
