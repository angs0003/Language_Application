# Spoken-word highlight

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Spoken-word highlight** (`hlTrack`, `hlClear` in js/lessons.js): the word being spoken gets `.tk.spoken` in the Player, "Play all sentences",
the story reader and the podcast list. It uses the voice's word boundary events when sent, otherwise a timing estimate (`HL.msPerChar`).
Setting `S.settings.hlWord` (default on). After the last line the item is marked done (`plMarkDone`: `chRead`, `podDone`, `tripDone`),
the main button becomes the next item (`nextAfter`) and Listen tiles show a tick.
