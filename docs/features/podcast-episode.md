# Podcast episode

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Podcast episode** (`view.s="pod"`, `openPod`, `podSegs`, `screenPod`, `podGo`, `podStatus` in js/listen.js): two parts, Words and Story. Only the target language is spoken (no English host lines, no intro, questions or outro). Each word or story line is one box (`.podit`): the word or line, its reading, and `– English` after it in the same box. The text chips (Both languages, Target only, No text) control the English and the boxes. The top card has Previous and Next (jump to the previous or next item, playing or paused; tapping a box also jumps) and a collapsed Options row (speed, text, repeat line, Player view). The status line in the header shows the part and the place, for example `Words · 3 of 5`.
