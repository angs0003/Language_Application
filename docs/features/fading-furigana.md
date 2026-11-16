# Fading furigana

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Fading furigana** (`furiFor`, inside `glossHTML`): Japanese tokens containing kanji get a `<ruby>` reading,
converted from the token's romaji, unless all kanji in the token are learned.
Setting `S.settings.furi`: `fade` (default), `always`, `never`.
1. The reading is built by `furiFor(l,t)` (js/kanji.js), which calls `furiKana(text,romaji)`. `furiKana` converts with `toHira()`.
2. The romaji cannot tell づ from ず or ぢ from じ (the content spells づ “zu” and ぢ “ji”; older entries may use “dzu” and “dji”).
   `furiKana` restores づ and ぢ with the table `FURI_DZ` in js/kanji.js: each entry is [kanji in the token, romaji stem with z or j, same stem with dz or dj].
   It works with both spellings.
3. A new Japanese word whose kana has づ or ぢ needs a `FURI_DZ` entry. tests/kanji.test.js fails when an entry is missing.
4. Write romaji so `toHira` gives correct kana (for example `kin’youbi` with an apostrophe before `y`).
