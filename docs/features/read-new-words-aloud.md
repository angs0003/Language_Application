# Read new words aloud

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Read new words aloud** (`readWordCard` in js/lessons.js, setting `S.settings.autoRead`, default on, toggle in Settings): when a word of the lesson's New words step opens (lesson start, Continue, Back), the word and then its example sentence are read aloud, and the example's words are highlighted while spoken. It is called only after a tap, not on every redraw, so saving a word with the star does not read it again. Later steps are not read automatically. This is audio only: the screen never advances by itself (design rule 8).
