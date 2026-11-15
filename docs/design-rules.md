# Design rules (do not break these)

Moved from CLAUDE.md section 3. The approved design is on the owner's design canvas ("Language Steps app mockups", row "Full-detail screens"). Match it for any new screen.


1. **Navigation:** a bottom tab bar with 4 tabs: **Learn**, **Practise**, **Listen**, **Travel**. The tabs share one colour (see rule 6).
   The language drop-down (Japanese or Chinese) and the profile button (Settings) are in the top bar of a tab screen.
   Do not add a 5th tab; put new features inside an existing tab.
2. **One primary action per screen.** On tab screens it is the button inside the highlighted card (`.card.hero`).
   On all other screens it is the right-hand button of the bottom bar. Back is the left-hand button.
3. **Lesson template:** close button and progress bar at the top, one content area, Back and Continue at the bottom.
   Quiz feedback appears in the bottom panel (`#fbp`), green for correct and red for incorrect.
4. **No emoji in the interface.** Use the line icons in `ICONS` (js/ui.js) through `ico(name)`, and the status marks
   `STATUS.ok / half / todo / no`. `deEmoji()` removes any emoji that slips into rendered text; do not rely on it for new code.
5. **Components** (js/ui.js): `uiCard`, `uiLabel`, `uiBtn` (styles `pri`, `sec`, `link` only), `uiSeg`, `uiRow`,
   `uiTileIcon`, `uiTileChar`, `uiBar`, plus `.ibtn` icon buttons and `.tile` content tiles. Every icon-only button needs an `aria-label`.
6. **Colour and type:** tokens are CSS variables in index.html (`--c-learn`, `--t-learn`, ...). The **language** sets the colours of the whole app
   through `body[data-lang]`: Japanese is indigo blue (`--ja`, `--jaT`), Chinese is red (`--zh`, `--zhT`), with a slightly tinted background for Chinese.
   Tabs and sections do not have their own colours. Fonts: Atkinson Hyperlegible; Noto Sans JP/SC for characters.
   Characters (kanji, kana, hanzi) are used as artwork instead of photos.
7. **Touch targets** at least 44 px (most are 48 to 56 px). Body text 17 px.
8. **No timers, no auto-advance, no streak loss, no leaderboards, no flashing or animation.**
9. **Literal feedback**, "I do not know" on every question, Check answer before any result, Back to see earlier answers.
10. **Word readings appear when a word is tapped**: a callout opens above the word (below it when there is no room above) with the reading and the meaning, and the word is read aloud when you tap it (`openWord`, `placeCallout` in js/lessons.js). Saving a word to My words is the star at the top right of the New word card in a lesson (`starWord`). It closes on a tap outside, on Escape, on a tap of the same word, and on every redraw. The older bottom sheet (`openWordSheet`, `sheetHTML`) is kept for when AI is turned on. The setting "gloss" can show readings under every word.
11. Light and dark mode through the tokens. Use ’ and “ ” in visible text.
