# Word card and sentence word groups

Update this file when the feature changes.

**New word card** (New words step of a lesson, `js/lessons.js`):
1. Japanese words listed in `WHOLE_READING` (js/core.js, 31 words; 今年 and 時計 were added) have a reading that belongs to the whole word, not to each kanji. `wholeReading(word)` tells whether a word is in the list; `wholeReadingNote` is the one-line note “This reading belongs to the whole word, not to each kanji.” The card shows the note for these words (Japanese only).
2. Kun readings of the kanji 日 are ひ, -び, -か (content change).

**Word groups in sentences** (`glossHTML(..., grp)` in js/lessons.js):
1. The `grp` parameter wraps the last word and the closing punctuation in `<span class="tkg">` (`display:inline-flex; white-space:nowrap`, CSS in index.html), so that a full stop never moves alone to a new line.
2. Used by `sentHTML` and `sentMeaningHTML` in js/exercise-types.js. Not used by story lines or podcast lines.

**Tests:** smoke checks in tests/smoke.js; phone screen "Lesson: new word, reading of the whole word" (Japanese only) in tests/phone/screens.js; a phone test in tests/phone/phone.spec.js; one entry in tests/phone/touch-baseline.json.
