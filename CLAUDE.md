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
10. **Word readings appear when a word is tapped** (word sheet with Save). The setting "gloss" can show them under every word.
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
| `tools/upload-content.js` | Uploads content to the `content` table (`npm run upload`). Deletes rows that no longer exist. |
| `tests/smoke.js` | Simulated-browser flow test without a database. |
| `tests/sync.test.js` | Simulated-database test: sign-in screen, content from the database, two-device progress sync. |
| `tests/features.test.js` | Player, My words (filters, search, 4 practice modes), Mistakes practice and video player (speed, section loop, synced subtitles). |
| `tests/smoke.js` design checks | On each tab screen: no emoji, at most one primary button, no icon button without a label. |
| `tests/kanji.test.js` | Kana lessons, kanji lessons and stroke steps, fading furigana, TV list, kanji/kana sync. |
| `tests/phone/phone.spec.js` | Real browser (Chromium) at 360x740 and 412x915: each tab in both languages and the first lesson. No script errors, no sideways scrolling, at most one primary button, touch targets of at least 44 x 44 px (`npm run test:phone`; runs in the `test` check). |
| `tests/helpers.js` | Shared jsdom setup, a simulated Supabase client, and an answer "solver" for tests. |

## 5. App architecture

### Start-up (js/loader.js)
1. No database configured → load `content/content.js`, then the app files (`LS_CONTENT_SOURCE="bundled"`).
2. Database configured and no session → show the sign-in screen only. The app files are not loaded.
3. Session → read `meta:version` from `content`. If it differs from the device copy (`localStorage["ls-content-cache"]`),
   download all content rows and rebuild the globals with `buildContent`. Then load the app files
   (`LS_CONTENT_SOURCE="database"`). Offline → use the device copy.
4. Content globals: `ZH, JA, GR, STORY_ZH, STORY_JA, STORY, TRIP_ZH, TRIP_JA, PARTS, LEVELS, VIDS`.

### Database tables (supabase.sql)
- `content(key, lang, kind, ord, level, part, data)`: kinds `theme`, `chapter`, `grammar`, `trip`, `meta`
  (`meta:parts`, `meta:levels`, `meta:vids`, `meta:version`). Readable by signed-in users; written only by the upload tool.
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
  trip, pod, cards`. Each returns `{row, title, prog, main, back:{label,fn,dis}, next:{label,fn,dis}, exit}`.
- Buttons use `data-a="${A(fn)}"`; one delegated listener calls the function.
- Tab screens (js/ui.js): `homeLearn` (language switch, level, path built from themes and chapters; the next step comes
  from `planSteps()`), `homePractise` (one mixed session `startMixed()`, then My words, Kanji, Kana, Grammar),
  `homeListen` (filter, Continue card from `S[lang].lastListen`, tiles, Add a video, TV list), `homeTravel`.
  Sub-screens open with `openSub(key)` (themes, kanji, kana, grammar, watchadd) and reuse the older section renderers.
- Lesson: New words → Grammar → Story (theme's chapter) → Quiz → Summary (`AI_OFF=true` skips the Dialogue step).
- Exercises: meaning, listen, type, speak, match pairs, build sentence, listen-and-build, build English, fill blank, grammar choice.
- Review timing: `srsSet()`, `INTERVAL=[0,1,2,4,8,16]` days by box.
- Levels and parts: `PARTS` and `LEVELS` (in content); `grFor()` maps a theme to its grammar point.
- Podcast `podSegs()`.
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

- **Chinese word:** `[word, pinyin, meaning, example, example pinyin, example English]`
- **Japanese word:** `[word, kana, romaji, meaning, example, example romaji, example English]`
  (for kana-only words, kana = word).
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

## 9. Team setup in .claude/

Commands (`.claude/commands/`): `/add-part`, `/check-content`, `/design-check`, `/release`, `/add-video`, `/curate-videos`,
`/retro`, `/maintain`, `/ux-review`, `/content-report` (local only), `/content-gaps` (safe for public logs).
Subagents (`.claude/agents/`, 10): `planner` (read-only; writes the plan before any change), `content-writer`, `content-reviewer`,
`ui-engineer`, `test-runner`, `release-manager`, `coach`, `security-reviewer` (runs inside `/release`), `video-curator`
(VIDS and TVREC only), `data-engineer` (owns supabase.sql, js/sync.js, normalize() defaults and the sync tests).
Hooks (`.claude/settings.json`): the content validator runs after edits to `content/content.js`, and `npm test` must pass
before commit, push or upload.
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
Next planned (needs a plan first): a casual-speech grammar block for both languages (contractions, fillers, short replies, sentence endings), because the stories now use them but no lesson explains them.

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
