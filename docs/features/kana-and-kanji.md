# Kana and kanji

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**🈴 Kana and kanji** (Japanese tab only; `homeKanji`): hiragana and katakana rows (`KANA`, 71 + 71 characters)
with a learn screen per character (`screenKana`) and practice (`kanaQuiz`: reading choice, listen and choose,
match pairs); kanji in order of first appearance in the vocabulary (`KANJI_JA`, 1205 now), learned 5 at a time
(`screenKanjiLearn`, ends with "Finish lesson": no quiz, the 5 kanji get review timing through `kSet`), each with a card (`kanjiCardHTML`: meanings, on/kun readings, stroke count, step-by-step
stroke order, words from the lessons). Practice (`kanjiQuestions`): meaning, kanji from meaning, reading in a word,
match pairs. Progress: `S.ja.kana` and `S.ja.kanji` (`{b,d,u,lp}`), synced as `word_progress` rows with
lang `ja-kana` / `ja-kanji`. A kana or kanji counts as learned at box ≥ 2.
`kSet` uses `srsStep(e,ok,2)` (see review-timing.md): below box 2 a correct answer always raises the box, even before the due date; from box 2 up, a correct answer before the due date changes nothing. A wrong answer goes to box 1, due now, and counts a lapse (`lp`).
