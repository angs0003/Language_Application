# Fading furigana

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Fading furigana** (`furiFor`, inside `glossHTML`): Japanese tokens containing kanji get a `<ruby>` reading,
converted from the token's romaji with `toHira()`, unless all kanji in the token are learned.
Setting `S.settings.furi`: `fade` (default), `always`, `never`. Write romaji so `toHira` gives correct kana
(for example `kin’youbi` with an apostrophe before `y`, and `dzu` for づ: `kodzutsumi`).
