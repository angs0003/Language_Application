# CLAUDE.md: context for Claude Code

Read this whole file before changing anything. It is the single source of truth for how
this project works and how the owner wants changes made.

## 1. What this is

Language Steps is a static, single-page web app (PWA) for learning **Mandarin Chinese
(Simplified)** and **Japanese**, hosted on GitHub Pages. No build step, no framework,
no AI. **Supabase is the database for both progress and content.** Sign-in (email magic link)
is required. The device keeps a copy of content and progress for offline use.

The owner (AE) is learning both languages for a trip to Japan and China, and is a visual
learner who needs audio. The app must be **autism- and ADHD-friendly** (see section 3).

## 2. How to work with the owner

1. **Agree the plan before building.** For anything bigger than a small fix, describe the
   change (what, where, how it behaves) and wait for approval. This avoids rework.
2. Communicate **literally and precisely**: no idioms, sarcasm, metaphors or implied meaning.
3. **Lead with the answer.** Use numbered steps for processes and short sections for explanations.
4. State **assumptions and next steps** explicitly. Use the same term for the same thing.
5. Ask **one specific question at a time**.
6. State uncertainty directly, with a confidence level (for example "about 70%").
7. No guessing of emotions, no social pleasantries.
8. Prefer direct, outcome-focused conclusions over heavily qualified answers.

## 3. Design rules (do not break these)

The approved design is on the owner's design canvas ("Language Steps app mockups", row "Full-detail screens").
Match it for any new screen.

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

## 4. Files

| File | Purpose |
|---|---|
| `index.html` | Page shell and all CSS. Loads `config.js`, supabase-js, `js/content-rows.js`, `js/loader.js`. |
| `js/loader.js` | Starts the app: requires sign-in, loads content from the database (or the device copy), then loads the app files listed in `APP_FILES`, in order. |
| `js/content-rows.js` | Converts content to database rows and back (`buildRows`, `buildContent`). Shared by the browser and Node tools. |
| `js/core.js` | State, saving, helpers, audio, review timing. |
| `js/exercises.js` | Question building, checking and rendering; Mistakes recording (`misTrack`, `misRebuild`). |
| `js/lessons.js` | View state, click handling, placement quiz, lesson flow, review session, settings. |
| `js/sections.js` | Themes list, grammar guide, theme and grammar pages, story reader, travel situations. |
| `js/exercise-types.js` | Match pairs, build sentence, listen and build, build English, fill the blank. |
| `js/path.js` | Next-step planning (`planSteps`, `stepInfo`). |
| `js/listen.js` | Podcast, recap, My words, loop, text modes, Watch, player, video player. |
| `js/kanji.js` | Kana and kanji lessons, kanji cards, furigana, TV list. |
| `js/sync.js` | Database sync. |
| `js/ui.js` | Icons, components, the 4 tab screens, sub-screens (`openSub`), recommendations, the `render()` shell and start-up. |

The app files share one global scope and load in the order of `APP_FILES`. Keep that order; a file may only use, at load time,
names defined in earlier files (inside functions, any file's names can be used).
| `content/content.js` | **Master copy of all learning content.** Edit content here, then upload it. Also used by the app when no database is configured (tests). |
| `config.js` | Supabase URL and **anon** key (public by design). |
| `.env` (not in Git) | `SUPABASE_URL` and **`SUPABASE_SERVICE_ROLE_KEY`** for uploads. Never commit it; never put the service key in browser code. |
| `supabase.sql` | Tables and row-level security. Re-runnable. |
| `sw.js` | Service worker (offline). **Do not change `CACHE` by hand**: the Deploy workflow sets it to `ls-<commit ID>` on every release. |
| `.github/workflows/test.yml` | Runs `npm test` and `npm run lint` on every pull request (required check `test` before merging to `main`). |
| `.github/workflows/deploy.yml` | After a merge to `main`: test, upload content if `content/content.js` changed (secrets in GitHub), set `CACHE`, publish to GitHub Pages. |
| `tools/validate-content.js` | Structural check of the content, plus a content → rows → content round trip. |
| `tools/add-word-breaks.js`, `tools/lib-word-breaks.js`, `tools/check-word-breaks.js` | Word breaks of the example sentence of every word (section 6): `--todo` lists words, `--check file.json` checks a file, `file.json` adds it to `content.js`. `check-word-breaks.js` reports tokens whose meaning differs from the taught meaning of the same word (for review; it does not change anything). |
| `tools/upload-content.js` | Uploads content to the `content` table (`npm run upload`). Deletes rows that no longer exist. |
| `tests/smoke.js` | Simulated-browser flow test without a database. |
| `tests/sync.test.js` | Simulated-database test: sign-in screen, content from the database, two-device progress sync. |
| `tests/features.test.js` | Player, My words (filters, search, 4 practice modes), Mistakes practice and video player (speed, section loop, synced subtitles). |
| `tests/smoke.js` design checks | On each tab screen: no emoji, at most one primary button, no icon button without a label. |
| `tests/kanji.test.js` | Kana lessons, kanji lessons and stroke steps, fading furigana, TV list, kanji/kana sync. |
| `tests/casual.test.js` | Casual speech: row hidden when empty, list, lesson, quiz paths, done mark, sync to a second device, design checks. |
| `tests/phone/phone.spec.js` | Real browser (Chromium) on the two phones the app is made for, with Playwright's device profiles: iPhone 15 Pro (393 x 659 in Safari) and Pixel 9 Pro (427 x 876 in Chrome); no other sizes (`playwright.config.js`; `PW_WEBKIT=1` runs the iPhone in WebKit, the engine of Safari; the `test` check runs both; first time: `npx playwright install webkit`): each tab in both languages and the first lesson. No script errors, no sideways scrolling (measured against the configured screen width, because in phone emulation `window.innerWidth` grows with wide content), at most one primary button, touch targets of at least 44 x 44 px (`npm run test:phone`; runs in the `test` check). |
| `tests/phone/screens.js`, `tests/screens.test.js` | Registry of every screen (`screenX`, `homeX`) and how to open it. The phone test opens each registered screen in both languages and at both sizes (no script errors, no sideways scroll, one primary button, touch targets) and again with a wide monospace font, because the machine that runs the tests in GitHub has other fonts and text that cannot wrap then pushes the page sideways (a long status text in the lesson summary did exactly this). `screens.test.js` fails when a screen function is in neither the registry nor its skip list. Known breaches of rule 2 are listed there with `maxPrimary`; known small touch targets are in `tests/phone/touch-baseline.json`. |
| `tests/hooks.test.js`, `tests/gh.test.js` | The safety-rail hooks and the release helper `tools/gh.js` (against a fake GitHub). |
| `tools/gh.js` | Release helper without the gh CLI: `create` (draft pull request), `status`, `merge N --yes` (waits for green CI, refuses on a conflict, merges, waits for Deploy, deletes the branch, syncs main), `cleanup`. Uses the credential git already has and never prints it. |
| `tools/shot.js` | `npm run shot -- --js "openPod(0)" --name x`: screenshots of any screen on the iPhone 15 Pro and the Pixel 9 Pro in `tmp/shots/` (`--lang`, `--dark`, `--after`). |
| `tests/helpers.js` | Shared jsdom setup, a simulated Supabase client, and an answer "solver" for tests. |

## 5. App architecture

### Start-up (js/loader.js)
1. No database configured → load `content/content.js`, then the app files (`LS_CONTENT_SOURCE="bundled"`).
2. Database configured and no session → show the sign-in screen only. The app files are not loaded.
3. Session → read `meta:version` from `content`. If it differs from the device copy (`localStorage["ls-content-cache"]`),
   download all content rows and rebuild the globals with `buildContent`. Then load the app files
   (`LS_CONTENT_SOURCE="database"`). Offline → use the device copy.
3a. **Offline copy protection** (`window.LS_STORE` in js/loader.js, `storageLines` in js/lessons.js): after the content is loaded the loader checks that the device copy was saved (`cache` ok or failed, size in `kb`) and asks the browser not to remove it (`navigator.storage.persist()`, `persisted` true, false or null while unknown). Settings > Device check shows these as literal lines. Safari answers `persist()` from usage history and shows no prompt; a refusal is shown with the advice to add the app to the Home Screen.
4. Content globals: `ZH, JA, GR, STORY_ZH, STORY_JA, STORY, TRIP_ZH, TRIP_JA, PARTS, LEVELS, VIDS`.

### Database tables (supabase.sql)
- `content(key, lang, kind, ord, level, part, data)`: kinds `theme`, `chapter`, `grammar`, `trip`, `meta`
  (`meta:parts`, `meta:levels`, `meta:vids`, `meta:casual`, `meta:version`). Readable by signed-in users; written only by the upload tool.
- `word_progress(user_id, lang, word, box, due, saved, reading, meaning, sentence, source, saved_box, saved_due, saved_at, updated_at)`.
- `activity(user_id, lang, kind, key, done_at)`: kinds `chapter`, `trip`, `trip_open`, `podcast`, `grammar`.
- `user_settings(user_id, data, updated_at)`: settings plus per-language details (placed, gi, lc, lst, hist, lastLesson, videos).
- Row-level security: each user reads and writes only their own progress rows.

### Progress sync (js/sync.js)
- The in-memory state `S` is the working model (also saved in `localStorage` key `language-steps-v1`).
- `save()` → `dbQueue()` → after 1.5 s `dbPush()`: converts `S` to rows (`stateRows`), sends only changed rows,
  deletes word rows that no longer exist. Offline errors keep changes on the device; the `online` event retries.
- Start-up `dbPull()`: reads all three tables and merges with `mergeRemote`: settings from the newer side,
  each word from the newer side (timestamp `u` on srs and saved entries), activity as a union.
- **Any new progress field must be added to `stateRows` and `mergeRemote`, and to `normalize()`.**

### State, rendering and features
- `S`: `{v:1, updatedAt, lastActive, lang, tab, settings:{...}, zh:{...}, ja:{...}}`. Per language: `placed, srs{word:{b,d,u}},
  gi, grDone[], lc, lst, chRead[], tripDone{}, tripOpen{}, podDone{}, hist[], lastLesson[], saved[], videos[], mis[]`.
  Always load through `normalize()`. Call `save()` after any change.
- `render()` (js/ui.js) calls one `screenX()` per view (`view.s`): `home, lesson, place, review, test, settings, theme, gram, story,
  trip, pod, cards, casual`. Each returns `{row, title, prog, main, back:{label,fn,dis}, next:{label,fn,dis}, exit}`.
- Buttons use `data-a="${A(fn)}"`; one delegated listener calls the function.
- Tab screens (js/ui.js): `homeLearn` (language switch, level, path built from themes and chapters; the next step comes
  from `planSteps()`), `homePractise` (one mixed session `startMixed()`, then My words, Kanji, Kana, Grammar),
  `homeListen` (filter, Continue card from `S[lang].lastListen`, tiles, Add a video, TV list), `homeTravel`.
  Sub-screens open with `openSub(key)` (themes, kanji, kana, grammar, watchadd) and reuse the older section renderers.
- Lesson: New words → Grammar → Story (theme's chapter) → Quiz → Summary (`AI_OFF=true` skips the Dialogue step).
- **Read new words aloud** (`readWordCard` in js/lessons.js, setting `S.settings.autoRead`, default on, toggle in Settings): when a word of the lesson's New words step opens (lesson start, Continue, Back), the word and then its example sentence are read aloud, and the example's words are highlighted while spoken. It is called only after a tap, not on every redraw, so saving a word with the star does not read it again. Later steps are not read automatically. This is audio only: the screen never advances by itself (design rule 8).
- **System Back** (Android back gesture or button, browser back; `syncHistory`, the `popstate` listener and `lastBack` in js/lessons.js, called from `render()`): while a screen that is not a tab screen is open, one history entry is pushed; going back runs the same Back as the bottom bar (or goes to the tab screen when that Back is disabled). An open word callout, Exit panel or bottom sheet is closed first. On a tab screen there is no extra entry, so the system Back leaves the app (for an installed app: to the phone home screen). Chrome skips history entries that a page adds without a tap, so one entry pushed inside the back handler was skipped by the next swipe and the app closed on the second swipe. Now `histFill` pushes 8 spare entries (`HIST_BUF`) while a tap is handled and a click listener refills them; `histDepth` counts the entries behind the current one, and leaving to a tab screen goes back over the rest with `history.go(-n)`.
- **Lesson place** (`S[lang].resume` = `{ti, words[], title, step, i, u}`; `lessonSave`, `lessonResumeFor`, `lessonResumeText`, `startLesson(words,title,repeat,fresh)` in js/lessons.js): moving inside a lesson saves the place (not for repeat lessons; a place at the first word is cleared; a place in the Quiz step is saved as the start of the quiz, because quiz questions are generated each time).
  `startLesson` continues a matching saved place unless `fresh` is true. The Summary step and "Start from the beginning" clear it. The Learn card then says "Continue lesson". Synced inside `user_settings.data.per[lang]` like `mis` (last-write-wins, no SQL change).
  Back on the first word of a lesson leaves the lesson; Back on the first question of a review session, test or placement quiz opens the same "Exit now?" panel as the X button.
- Exercises: meaning, listen, type, speak, match pairs, build sentence, listen-and-build, build English, fill blank, grammar choice.
  Sentence exercises (build, blank) are wrapped in `.qarea` (js/exercise-types.js `exHTML`): the prompt and the answer row stay at the top and the word tiles (`.bank`) or options (`.opts`) sit at the bottom, above the bottom bar, within thumb reach (min-height from `100svh`; if the header or bottom bar height changes, adjust `.qarea` in index.html; a media query for screens under 720 px high, such as the iPhone in Safari, tightens the spacing so that the tiles fit without scrolling). The prompt of "Build the English meaning" and "Listen and build" and the sentence of "Choose the missing word" are in a speech bubble (`.bubblerow`, `.bubble`); the feedback of a sentence question shows `Meaning: English` (`sentMeaningHTML`).
- **Read questions aloud** (`readQuestion` in js/lessons.js, same setting `autoRead`): when a quiz or review question opens (lesson Quiz step, Review, Mistakes, Sentences), the sentence of "Build the English meaning" and "Listen and build" and the word of "What does this word mean?" and "Listen and choose" are read aloud. Never "Choose the missing word" (the missing word is the answer), "Build this sentence" (English given), typed or spoken answers. Called after a tap, not on every redraw.
- **Sentences session** (Practise tab row "Sentences", and the button "Practise these sentences" on the page of a learned theme; `sentenceTargets`, `startSentences(themeIndex?)` in js/ui.js; `view.s="review"` with `view.sents=true`): up to 10 questions from the practice sentences of the themes whose words are all learned, mixing Build the English meaning, Choose the missing word, Build this sentence and Listen and build. It uses the review screen, so wrong answers are recorded in Mistakes.
- Review timing: `srsSet()` and `srsStep()` (js/core.js), `INTERVAL=[0,1,2,4,8,16]` days by box. A wrong answer goes to box 1 and is due now. A correct answer raises the box only when the word was due; a correct answer before the due date (for example in "Practise anyway", My words practice, flashcards) keeps the schedule. Kana and kanji (`kSet`) are not changed, because "learned" is box 2 or higher there.
- Levels and parts: `PARTS` and `LEVELS` (in content); `grFor()` maps a theme to its grammar point.
- **Podcast episode** (`view.s="pod"`, `openPod`, `podSegs`, `screenPod`, `podGo`, `podStatus` in js/listen.js): two parts, Words and Story. Only the target language is spoken (no English host lines, no intro, questions or outro). Each word or story line is one box (`.podit`): the word or line, its reading, and `– English` after it in the same box. The text chips (Both languages, Target only, No text) control the English and the boxes. The top card has Previous and Next (jump to the previous or next item, playing or paused; tapping a box also jumps) and a collapsed Options row (speed, text, repeat line, Player view). The status line in the header shows the part and the place, for example `Words · 3 of 5`.
- **Story reader** (`view.s="story"`, `openChapter`, `screenStory`, `storyBubble`, `playOneLine`, `readStoryLine` in js/sections.js): phase `read` is a conversation of speech bubbles (`.brow`, `.bubble`, `.avatar`): one bubble per line, the speaker's first character as the avatar (two avatar styles for two speakers; narration lines have none), a speaker button in each bubble, the words as tappable tokens (word callout) and the English under the line. `view.shown` lines are visible; Continue shows the next line and reads it aloud (setting `autoRead`), Back removes the last bubble (on the first line it leaves the story), and after the last line the main button is "Answer N questions" (phases `q` and `done` as before; the chapter is marked as read at `done`). The speaker name tokens are hidden with CSS (`data-skip`, `.spkname`) but stay in the page so that the spoken-word highlight keeps its token positions. Speed, text mode and "Show all lines" are in a collapsed Options row. The Listen tiles and the Continue card open this reader. The podcast's story lines use the same avatars.
- **🎬 Player** (`view.s="player"`, `openPlayer(kind,i)` with kind `story`, `pod` or `trip`): one line at a time, large and
  centred; text modes (`S.settings.sub`: both, target, none); auto-play or auto-pause (`S.settings.autoPause`); previous/next
  line, 🔁 loop line, speed. Tapping a word pauses playback and opens the word card.
- **⭐ My words** (`view.s="vocab"`, `screenVocab`): search (filters the list in the DOM, no re-render), source filter
  (`srcKind` from the saved item's `src`), and 4 practice modes: Flashcards (`screenCards`), Sentence order (needs the
  saved sentence tokens `tk`), Meaning quiz, Listen and choose. Practice answers update the saved item's own schedule
  (`q.vitem` in `onAnswer`).
- **📺 Video library** (`homeWatch`, `screenVideo`): level filter; catalogue videos are `VIDS` items **with** an `id`;
  channel recommendations are `VIDS` items **without** an `id` (they open YouTube). User videos are stored in
  `S[lang].videos` (title, id, level). The in-app player uses the YouTube IFrame API (`loadYT`): speed
  (`setPlaybackRate`), back 5 seconds, section loop between a start and an end point, and synced subtitles when the
  video has a `transcript`. Watched state: `videos[].watched` and `S[lang].videosWatched` for catalogue videos.
- **🈴 Kana and kanji** (Japanese tab only; `homeKanji`): hiragana and katakana rows (`KANA`, 71 + 71 characters)
  with a learn screen per character (`screenKana`) and practice (`kanaQuiz`: reading choice, listen and choose,
  match pairs); kanji in order of first appearance in the vocabulary (`KANJI_JA`, 1205 now), learned 5 at a time
  (`screenKanjiLearn`, ends with "Finish lesson": no quiz, the 5 kanji get review timing through `kSet`), each with a card (`kanjiCardHTML`: meanings, on/kun readings, stroke count, step-by-step
  stroke order, words from the lessons). Practice (`kanjiQuestions`): meaning, kanji from meaning, reading in a word,
  match pairs. Progress: `S.ja.kana` and `S.ja.kanji` (`{b,d,u}`), synced as `word_progress` rows with
  lang `ja-kana` / `ja-kanji`. A kana or kanji counts as learned at box ≥ 2.
- **Mistakes** (`S[lang].mis`, newest first, at most 50 per language): wrong answers to sentence and grammar questions (kinds `build`, `blank`, `gram`,
  including story comprehension and travel reply questions) are recorded by `misTrack` (js/exercises.js, called from `onAnswer`; not during the placement quiz or test).
  Each item stores a snapshot of the question; `misRebuild` turns it back into a question. `startMistakes` (js/ui.js, row "Mistakes" in `homePractise`) opens a
  review session (`view.mis=true`) with up to 10 items. A wrong answer (including “I do not know”) repeats the question once at the end of the same session
  (the rebuilt question has `again=true`, so it is not queued a second time). If the repeat is wrong too, the session can still finish and the item stays in
  Mistakes for a later session. A correct answer removes the item. `mis` is synced inside `user_settings.data.per[lang]` (not as separate rows); on a conflict
  the newer side wins as a whole list (last-write-wins).
- **Casual speech** (Practise tab; `CASUAL[lang]`, `openSub("casual")`, `view.s="casual"`, `casualList`, `casualLesson`, `casualMark`, `screenCasual`, `startCasualQuiz` in js/sections.js): 12 lessons per language on how people really speak
  (Japanese: plain-form questions, dropped particles, てる, ちゃった, じゃん, short replies, fillers, ね/よ, かな/でしょ, inviting, reactions, who gets which form; Chinese: 吧, 啊, 呢, 嘛, 儿化, dropped subject,
  short replies, fillers, ordering, agreeing and refusing, reactions, 你 and 您). A lesson shows each pair as a Polite and a Casual line (audio, word taps, furigana), then a quiz ("Which would you say to ...?" and
  "Which version is polite?") that reuses the grammar-choice engine; wrong answers are not added to Mistakes. The row is hidden when `CASUAL[lang]` is empty or missing (old cached content). Progress is
  `S[lang].casualDone` = `{lessonIndex: timestamp}`, synced inside `user_settings.data.per[lang]` like `real` (last-write-wins for the whole object, no SQL change). Because the key is the lesson's position,
  **only append new lessons to `CASUAL`; never insert or reorder them.**
- **Real-situation log** (Travel tab; `S[lang].real`, `homeReal` and `realBlock` in js/sections.js): under each phrase in a situation's "You say" tab, "I used this in real life" opens 3 results
  (`ok` Understood, `repeat` Asked me to repeat, `english` Answered in English). `S[lang].real` is `{ "<phrase text>": {r, t} }`, the latest result per phrase wins, and a phrase that
  no longer exists in the content is skipped. The Travel tab shows counts and the row "Phrases to review" (sub-screen `openSub("real")`: phrases whose latest result is
  `repeat` or `english`; tapping plays the phrase; "Understood" removes it). Synced inside `user_settings.data.per[lang]` like `mis` (last-write-wins for the whole object, no SQL change).
  Because the key is the phrase text, replacing a phrase in the content resets its result.
- **Spoken-word highlight** (`hlTrack`, `hlClear` in js/lessons.js): the word being spoken gets `.tk.spoken` in the Player, "Play all sentences",
  the story reader and the podcast list. It uses the voice's word boundary events when sent, otherwise a timing estimate (`HL.msPerChar`).
  Setting `S.settings.hlWord` (default on). After the last line the item is marked done (`plMarkDone`: `chRead`, `podDone`, `tripDone`),
  the main button becomes the next item (`nextAfter`) and Listen tiles show a tick.
- **Speaker voices** (`spkSkip`, `spokenText`, `spkMap`, `applySpeaker` in js/lessons.js): story lines start with a name and a colon in the text.
  The name is shown but not spoken (also not in the English podcast lines). Each speaker gets another voice and pitch, in order of first appearance;
  voices alternate between names that look female and the rest. Pitch is ignored by some phone voices.
- **Fading furigana** (`furiFor`, inside `glossHTML`): Japanese tokens containing kanji get a `<ruby>` reading,
  converted from the token's romaji with `toHira()`, unless all kanji in the token are learned.
  Setting `S.settings.furi`: `fade` (default), `always`, `never`. Write romaji so `toHira` gives correct kana
  (for example `kin’youbi` with an apostrophe before `y`, and `dzu` for づ: `kodzutsumi`).
- **TV list** (`TVREC`, `tvCard` in Watch): title, service, length, why it fits, rating with its source, suggested level.
- AI: `AI_OFF=true`. Never call AI APIs from the browser. If AI is added later, use a server function.

## 6. Content format (content/content.js)

- **Chinese word:** `[word, pinyin, meaning, example, example pinyin, example English, example with word breaks]`
- **Japanese word:** `[word, kana, romaji, meaning, example, example romaji, example English, example with word breaks]`
  (for kana-only words, kana = word).
- **Example with word breaks** (last element, required; the validator fails without it): the example sentence in the sentence-string format below, one token per word with its reading and meaning in this sentence,
  punctuation as bare tokens, ending with `= example English` (the same English as the example). The token texts must join to the example, the token readings must join to the example reading (case, spaces, tone marks and apostrophes ignored),
  and one token must be the word itself (or its inflected form). A token meaning must never contain ` / ` (write `(at/to)`). The lesson shows this sentence under each new word, and each word opens the word callout.
  Add the sentences with `node tools/add-word-breaks.js file.json` (a JSON file `{"zh":{"word":"sentence string"}}`); check meanings with `node tools/check-word-breaks.js`.
- **Theme:** `["Title", [10 words], [6 sentence strings]]` (Level 1 themes 1 to 8 have 5 words). The third element holds the theme’s
  **practice sentences**: 6 sentences in the sentence-string format below, with **no speaker labels**, 2 to 8 content tokens each, using
  only words, grammar and kanji the learner has met. They appear in the lesson’s **Sentences** step and in the quiz (up to 4 sentence
  questions). Inflected forms of theme verbs and い-adjectives count as the theme’s words. Write new themes with the sentences included.
- **Sentence string** (stories and travel): tokens separated by `" / "`, each token
  `text|reading|meaning`; punctuation is a bare token; then `" = English translation"`.
  Example: `"私|watashi|I / は|wa|(topic) / 学生|gakusei|student / です|desu|am / 。 = I am a student."`
  Japanese readings are romaji; write the particles は and を as `wa` and `o`.
- **Story chapter:** `{t:"English title", l:[6 to 8 sentence strings], q:[[afterLineIndex, "Question?", ["correct","wrong","wrong"], 0, "Literal reason."]]}`.
  Chapter *n* belongs to theme *n*: **the number of chapters must equal the number of themes**.
- **Grammar point:** `["Title", "Pattern", "Literal explanation.", [tokens as arrays], "English"]`.
- **Kanji entry (in `KANJI_JA`):** `{c, m:[meanings], on:[readings], kun:[readings with "." before okurigana], n:strokes, p:[SVG stroke paths]}`.
  Every kanji used in `JA` words must exist in `KANJI_JA` (the validator checks this). For new kanji, take meanings and
  readings from KANJIDIC2 and stroke paths from KanjiVG (`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/0XXXX.svg`,
  5-digit lowercase hex code), in the same order as first appearance. Keep the credits in Settings.
- **Catalogue video (in `VIDS`):** `{id:"11-character YouTube id", title, ch:"channel", lvn:level number, len:"5 minutes", has:"what it uses",
  transcript:[{t:startSeconds, line:"sentence string as above"}]}`. Add a transcript only for videos the owner chooses,
  and only with text the owner provides or approves. Times must increase.
- **Casual lesson (in `CASUAL`, `{ja:[...], zh:[...]}`):** `{t:"Title", e:"Literal explanation.", p:[[politeSentence, casualSentence, "who you say the casual one to"], ...4 to 6 pairs]}`, sentence strings as above;
  the two sentences of a pair must differ. Append only.
- **Travel situation:** `{e, t, intro, facts[], hear[sentences], say[[polite, casual|null]], local[[word,reading,meaning,note]], etiq[], drill[[hearIdx, sayIdx]], role["h0","s0",...]}`.
- Characters: Japanese story follows ゆい (Yui) in Tokyo with けん, 田中先生, 山田さん;
  Chinese story follows 小文 (Xiǎo Wén) in Beijing with 大明, 李老师, 王阿姨. Keep facts consistent
  with earlier chapters (for example, Daming's father is a teacher).
- Language rules for all content: literal, no idioms, no metaphors, no sarcasm.
- **Spoken register** (stories, practice sentences, examples, travel phrases): write how people really speak, not textbook text.
  1. Friends and family use plain form (Japanese: 待った？ not 待ちましたか; Chinese: short sentences, 吧, 啊, 呢, 嘛, 儿化 where natural in Beijing).
  2. Staff, teachers, 山田さん and strangers stay polite. Keigo only in the right direction (尊敬語 for others, 謙譲語 for the speaker; teachers say います to students).
  3. Drop the subject when clear (no 私は or あなた in every sentence); use short replies (うん, ううん, いいよ; 嗯, 好的, 行).
  4. Use spoken words in speech, not written or news words (今 not 現在; 降りる not 下車; 可是 not 然而; 所以 not 因此). Written words only in reading text.
  5. Use real measure words and real situations (一份饺子, 这个故事; a bank scene stays at a bank).
  6. Travel `say` lists hold the phrase a traveller really uses first; keep an older or more formal phrase as the second form. New phrases are appended so existing indexes stay valid.
- **No duplicate words** within a language across all themes.

## 7. How to add a content part (150 words)

Tools that help (all in `tools/`): `check-words.js` (word lists), `check-chapters.js` and `check-sentences.js` (stories and practice sentences,
including a check for words the learner has not met yet), `add-kanji.js` (adds missing kanji with stroke order from KanjiVG and
readings from KANJI_JA sources), `validate-content.js` (everything, also run by `npm test`), `check-dictionary.js`
(`npm run dict`: each word's reading against CC-CEDICT and JMdict; report only; `npm run dict:get` downloads JMdict to `tmp/dict/`). Lesson order: Words, Grammar, Sentences, Story, Quiz, Summary.

1. In `content/content.js`, write the new themes as a new array (for example `const JA5=[...]`, 15 themes × 10 words, each with its 6 sentences),
   10 grammar points (`const GR_JA3=[...]`) and 15 chapters (`const STORY_JA3=[...]`), following section 6.
2. Append them next to the existing appends: `JA.push(...JA5)`, `STORY_JA.push(...STORY_JA3)`, and
   `GR.ja.push(...GR_JA3)` (next to `GR.ja.push(...GR_JA2)`).
3. In `content/content.js`, add one entry to `PARTS.ja`, for example `{lv:2,t:34,g:20,n:10}`
   (`t` = number of Japanese themes before this part, `g` = number of Japanese grammar points before it).
4. Update the matching label in `LEVELS`.
4a. Run `node tools/add-kanji.js` to add the kanji the new Japanese words use.
4b. Add the word breaks of every new word's example sentence (`node tools/add-word-breaks.js --todo ja FROM TO` lists them; `--check` then add). `npm test` fails without them.
5. Run `npm test`. Fix every error.
6. Run `/release`: it commits to a branch and opens a pull request. Do not run `npm run upload` and do not change `CACHE`.
7. After the owner merges, the Deploy workflow uploads the content and publishes. The app downloads the new content at its next start.

## 8. Definition of done (every change)

1. `npm test` passes (content check, round trip, smoke, sync, features and kanji tests), `npm run lint` reports no errors,
   and `npm run test:phone` passes (first time on a computer: `npx playwright install chromium`).
2. No design rule in section 3 is broken.
3. New visible text is literal and uses the existing terms.
4. Changes are committed to a branch (never to `main`) and a pull request to `main` is open. Never push to `main`.
   Do not change `CACHE` in `sw.js` and do not run `npm run upload`: the Deploy workflow does both after the merge.
5. Tell the owner what changed, in numbered points, with the pull request link. The owner merges after the `test` check is green.
6. For a UI change: look at screenshots (`/shot`) in both languages and at both phone sizes, and test every screen where the feature appears. A new screen is added to `tests/phone/screens.js`.

## 9. Team setup in .claude/

Commands (`.claude/commands/`): `/add-part`, `/check-content`, `/design-check`, `/release`, `/add-video`, `/curate-videos`,
`/retro`, `/maintain`, `/ux-review`, `/content-report` (local only), `/content-gaps` (safe for public logs), `/ship` (pull request, CI, merge after the owner says so, cleanup),
`/shot` (screenshots of any screen at the phone sizes).
Subagents (`.claude/agents/`, 10): `planner` (read-only; writes the plan before any change), `content-writer`, `content-reviewer`,
`ui-engineer`, `test-runner`, `release-manager`, `coach`, `security-reviewer` (runs inside `/release`), `video-curator`
(VIDS and TVREC only), `data-engineer` (owns supabase.sql, js/sync.js, normalize() defaults and the sync tests).
Hooks (`.claude/settings.json`, scripts in `.claude/hooks/`): the content validator runs after edits to `content/content.js`.
Safety rails (tested in `tests/hooks.test.js`): `guard-release.js` blocks a push to `main` or `master` (also by refspec, and a push with no target while on main), every force-push,
a commit on `main`, and the content upload, and requires `npm test` to pass before any commit or push. `guard-files.js` blocks edits to `.env*`, `.github/workflows/*`,
`.claude/settings*.json`, the guard scripts and any change to `CACHE` in `sw.js`. The owner can allow one protected edit by setting `ALLOW_PROTECTED_EDIT=1` for the session.
Changing the guards or `.claude/settings.json` needs the owner to name the file.
Improvement loop: `/retro` after every release (coach subagent proposes edits to this file, the agents, the commands and the
tests, with evidence), `/maintain` and `/content-gaps` monthly (automatic, see section 12), `/ux-review` quarterly,
`/content-report` monthly on the owner's computer. Inputs: GitHub issues (label `content-error` for content problems),
`docs/ux-notes.md`, `docs/decisions/`. Delivery (decision 0004): agents work on a branch and open a pull request;
GitHub Actions runs `test` on the pull request; `main` accepts changes only through a pull request with a green `test` check;
after the owner merges, `deploy.yml` tests again, uploads content, sets `CACHE` and publishes to GitHub Pages.
Guide for the owner: `docs/claude-code-team.md`. Keep these files consistent with sections 3, 6, 8 and 12 when rules change.

## 10. Roadmap (agreed order)

Content batches (each about 150 words, 10 grammar points, 15 chapters):
1. Done and released: Japanese Level 2 (rest of JLPT N5), Parts 1 to 4 (600 words). Some words are usually taught at JLPT N4; the Level 2 label says so.
2. Done and released: Chinese Level 3 (HSK 3), Parts 1 and 2 (300 words).
3. Done and released: Japanese Level 3 (JLPT N4), Parts 1 to 5 (750 words).
4. Done and released: Chinese Level 4 (HSK 4), Parts 1 to 4 (600 words). Chinese now has 124 themes, 1200 words, 80 grammar points.
5. Japanese Level 4 (JLPT N3): Parts 1 to 5 done and released (750 words, about half of the N3 vocabulary). More parts are possible. Japanese now has 229 themes, 2250 words, 150 grammar points.
(JLPT has no official word lists, so part counts are estimates.)

Agreed feature batches (in this order):
1. Done: database, required sign-in, content upload, offline copy.
2. Done: 🎬 Player for stories, podcast episodes and travel conversations: one line at a time, large and centred;
   text modes (both, target only, none); auto-play or auto-pause after each line; play/pause, previous/next line,
   🔁 loop, speed; tap a word to see it and ⭐ save it.
3. Done: ⭐ My words like Lingopie's My Vocab: search, filter by source, and 4 practice modes from saved words
   (Flashcards, Sentence order, Meaning quiz, Listen and choose).
4. Done: 📺 Video library: catalogue cards by level; YouTube player inside the app with speed and 🔁 section loop;
   synced dual subtitles only for videos that have a transcript in the database (added one by one, chosen by the owner).
5. Done: Real-situation log (Travel tab): the learner records the result of using a travel phrase in real life and reviews the phrases that did not work.
6. Done (November 2026): spoken-register pass over all Japanese and Chinese content, 5 real-speech videos in `VIDS` (no transcripts), about 75 survival phrases added to the travel situations.

Open content task: fill the `VIDS` catalogue with exact YouTube videos per level. Criteria (all required):
under about 25 minutes or self-contained; slow or clear speech or a repeating structure; low sensory load
(few loud effects, no rapid cuts); visual support for meaning; subtitles available. Verify each video ID by opening
its page. Good starting channels: Comprehensible Japanese (Yuki), Nihongo no Jikan, Mandarin Click, Slow & Clear Chinese.
Add TV titles to `TVREC` only with a rating that has a named source.

Feature ideas discussed but not built: kana lessons (Japanese) and pinyin/tone lessons (Chinese);
typed AI role-play through a server function; calm motivation (daily goal, progress calendar);
mistakes review for sentences and grammar; Chinese character (hanzi) lessons like the kanji section.
Done (November 2026): Casual speech section (12 lessons per language) in the Practise tab. Next planned: none agreed.

## 11. Known limitations

1. Audio uses the device's speech voices. Quality depends on the device.
2. Speech recognition works in Chrome (Android and computers). On iPhone it depends on Safari settings.
3. Vibration does not work on iPhone browsers.
4. Content was written without a native-speaker review. In November 2026 agents audited it for naturalness and rewrote the lines that were too formal or
   written-style; this is not a native review. Some written-style words remain in the word lists on purpose (changing a word list risks duplicate words and
   lost review progress). If the owner reports an error, fix it in `content.js` and re-run the checks.
5. `tools/check-chapters.js` reports "uses only 5 of the theme's 10 words" for Level 1 themes 1 to 8, because those themes have 5 words. Ignore that warning there.

## 12. Working unattended in GitHub (decision 0005)

The repository is public: every Actions log, comment and pull request is public.

1. **Triggers:** `claude.yml` (the owner writes `@claude` in an issue or comment), `review.yml` (every non-draft pull request),
   `monthly.yml` (1st of every month: `/maintain` and `/content-gaps`, each opens an issue). Login: the owner's
   Claude subscription token (`CLAUDE_CODE_OAUTH_TOKEN`). These workflows never receive the Supabase secrets.
2. **Plan first:** for anything that is not a small fix (under 30 changed lines, one file, no behaviour change), use the
   `planner` subagent, post the plan as a comment and stop. Build only after the owner comments `@claude approved`.
3. **One issue, one branch, one pull request.** Branch names: `content/...`, `feature/...`, `fix/...`, `chore/...`.
   The pull request description lists the changes in numbered points and contains `Closes #N`.
4. **Never:** push to `main`, run `npm run upload`, change `CACHE`, edit `.github/workflows/` or `.claude/settings.json`
   unless the issue names the file, read the database, or print environment variables.
5. **Reports** (monthly runs, reviews) change no files. The owner acts on them with `@claude do items N and M`.
6. **Personal data** (learning progress) is never read in GitHub Actions. `/content-report` runs only on the owner's computer.
