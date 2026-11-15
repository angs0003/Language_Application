# App architecture

Moved from CLAUDE.md section 5 (features are in docs/features/).


### Start-up (js/loader.js)
1. No database configured → load `content/manifest.js` and each part of `content/parts/` in its order, then the app files (`LS_CONTENT_SOURCE="bundled"`).
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
- Exercises: meaning, listen, type, speak, match pairs, build sentence, listen-and-build, build English, fill blank, grammar choice.
  Sentence exercises (build, blank) are wrapped in `.qarea` (js/exercise-types.js `exHTML`): the prompt and the answer row stay at the top and the word tiles (`.bank`) or options (`.opts`) sit at the bottom, above the bottom bar, within thumb reach (min-height from `100svh`; if the header or bottom bar height changes, adjust `.qarea` in index.html; a media query for screens under 720 px high, such as the iPhone in Safari, tightens the spacing so that the tiles fit without scrolling). The prompt of "Build the English meaning" and "Listen and build" and the sentence of "Choose the missing word" are in a speech bubble (`.bubblerow`, `.bubble`); the feedback of a sentence question shows `Meaning: English` (`sentMeaningHTML`).
- Review timing: `srsSet()` and `srsStep()` (js/core.js), `INTERVAL=[0,1,2,4,8,16]` days by box. A wrong answer goes to box 1 and is due now. A correct answer raises the box only when the word was due; a correct answer before the due date (for example in "Practise anyway", My words practice, flashcards) keeps the schedule. Kana and kanji (`kSet`) are not changed, because "learned" is box 2 or higher there.
- Levels and parts: `PARTS` and `LEVELS` (in content); `grFor()` maps a theme to its grammar point.
- AI: `AI_OFF=true`. Never call AI APIs from the browser. If AI is added later, use a server function.