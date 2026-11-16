# Answer options and spoken words

Update this file when the feature changes.

**Wrong options** (`mkQ` in js/exercises.js):
1. `meaningParts(m)` splits a meaning on "," and ";", ignores text in brackets and a leading "to", "a", "an", "the", and lower-cases it. `sameMeaning(a,b)` is true when the two meanings share a part.
2. `mkQ` does not offer a wrong option whose meaning shares a part with the right word's meaning.
3. For Japanese Listen questions, `mkQ` also rejects wrong options with the same kana as the right word (they sound the same).
4. `kanjiQuestions` (js/kanji.js) rejects wrong kanji that share any meaning with the right kanji (whole meanings, case-insensitive).

**Spoken words** (js/core.js):
1. `sayWord(w,l)` speaks the kana (`w.k`) for a Japanese word when it has one. Device voices read a kanji with their own reading (for example 体 as たい), so the kana is used.
2. `sayText(text,l)` speaks the kana only when the text is exactly a known word of that language. Otherwise it speaks the text.
3. `say(text,l)` is unchanged and is used for sentences.

**Typing romaji** (`normRomaji` in js/core.js): “dz” counts as “z” and “dj” counts as “j”.

**Tests:** tests/exercise-options.test.js.
