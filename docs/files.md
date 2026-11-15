# Files and tests

Moved from CLAUDE.md section 4.


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
| `content/parts/*.js`, `content/manifest.js` | **Master copy of all learning content**, in parts (about 18 files) loaded in the order of the manifest; each part starts with `/*@part NAME*/`. Edit content here; the Deploy workflow uploads it. Also used by the app when no database is configured (tests). `tools/lib-content-files.js` reads and writes the parts. |
| `config.js` | Supabase URL and **anon** key (public by design). |
| `.env` (not in Git) | `SUPABASE_URL` and **`SUPABASE_SERVICE_ROLE_KEY`** for uploads. Never commit it; never put the service key in browser code. |
| `supabase.sql` | Tables and row-level security. Re-runnable. |
| `sw.js` | Service worker (offline). **Do not change `CACHE` by hand**: the Deploy workflow sets it to `ls-<commit ID>` on every release. |
| `.github/workflows/test.yml` | Runs `npm test` and `npm run lint` on every pull request (required check `test` before merging to `main`). |
| `.github/workflows/deploy.yml` | After a merge to `main`: test, upload content if a file under `content/` changed (secrets in GitHub), set `CACHE`, publish to GitHub Pages. |
| `tools/validate-content.js` | Structural check of the content, plus a content → rows → content round trip. |
| `tools/add-word-breaks.js`, `tools/lib-word-breaks.js`, `tools/check-word-breaks.js` | Word breaks of the example sentence of every word (docs/content-format.md): `--todo` lists words, `--check file.json` checks a file, `file.json` adds it to `content.js`. `check-word-breaks.js` reports tokens whose meaning differs from the taught meaning of the same word (for review; it does not change anything). |
| `tools/add-accent.js` | `--get` downloads the Kanjium accent file to `tmp/accent/`; without a flag it matches every Japanese word (word and reading) and rewrites the `ACCENT_JA` block in `content/parts/kana-tv-accent.js`; `--report` lists words without accent. The validator checks that each key is a Japanese word and each number fits the mora count (`moras` in js/content-rows.js). |
| `tools/upload-content.js` | Uploads content to the `content` table (`npm run upload`). Deletes rows that no longer exist. |
| `tests/smoke.js` | Simulated-browser flow test without a database. |
| `tests/sync.test.js` | Simulated-database test: sign-in screen, content from the database, two-device progress sync. |
| `tests/features.test.js` | Player, My words (filters, search, 4 practice modes), Mistakes practice and video player (speed, section loop, synced subtitles). |
| `tests/smoke.js` design checks | On each tab screen: no emoji, at most one primary button, no icon button without a label. |
| `tests/kanji.test.js` | Kana lessons, kanji lessons and stroke steps, fading furigana, TV list, kanji/kana sync. |
| `tests/casual.test.js` | Casual speech: row hidden when empty, list, lesson, quiz paths, done mark, sync to a second device, design checks. |
| `tests/phone/phone.spec.js` | Real browser (Chromium) on the two phones the app is made for, with Playwright's device profiles: iPhone 15 Pro (393 x 659 in Safari) and Pixel 9 Pro (427 x 876 in Chrome); no other sizes (`playwright.config.js`; `PW_WEBKIT=1` runs the iPhone in WebKit, the engine of Safari; the `test` check runs both; first time: `npx playwright install webkit`): each tab in both languages and the first lesson. No script errors, no sideways scrolling (measured against the configured screen width, because in phone emulation `window.innerWidth` grows with wide content), at most one primary button, touch targets of at least 44 x 44 px (`npm run test:phone`; runs in the `test` check). |
| `tests/phone/screens.js`, `tests/screens.test.js` | Registry of every screen (`screenX`, `homeX`) and how to open it. The phone test opens each registered screen in both languages and at both sizes (no script errors, no sideways scroll, one primary button, touch targets) and again with a wide monospace font, because the machine that runs the tests in GitHub has other fonts and text that cannot wrap then pushes the page sideways (a long status text in the lesson summary did exactly this). `screens.test.js` fails when a screen function is in neither the registry nor its skip list. Known breaches of rule 2 are listed there with `maxPrimary`; known small touch targets are in `tests/phone/touch-baseline.json`. |
| `tests/phone/a11y.spec.js` | Accessibility check with axe (`@axe-core/playwright`, WCAG 2.2 A and AA) on every registered screen, in both languages, light and dark. Runs on the iPhone Chromium project only (about 2 minutes). A violation that cannot be fixed at once goes in `tests/phone/a11y-baseline.json` (the file does not exist while there are none); a new violation fails the test. |
| `tests/workflows.test.js` | Reads the workflows in `.github/workflows/` and `docs/proposed/`: valid YAML, no `pull_request_target`, no comment or title text inside a `run:` command, explicit permissions (a known gap is listed in the test). |
| `tests/proposed-guards.test.js` | Tests the proposed hardened guards in `docs/proposed/guards/` (bypasses found by the agent review, Bash writes to protected files, remembered test result). Delete it after the guards are applied and its cases moved into `tests/hooks.test.js`. |
| `tests/run-all.js` | What `npm test` runs: the content validator, the smoke test, then every `tests/*.test.js` file in alphabetical order, stopping at the first failure. A new test file needs no change to `package.json`. |
| `tests/globals.test.js` | Parses `js/*.js`, `config.js` and `content/parts/*.js` and fails when a top-level function, class, const, let or var name is declared twice (the files share one global scope). |
| `tests/agents.test.js` | Checks every file in `.claude/agents/`: name, a `model:` line (opus, sonnet or haiku), description, tools, an `Output:` and `Done when:` line, no `gh` tool, tool scripts that exist, and the subagent count written in section 9. |
| `tests/hooks.test.js`, `tests/gh.test.js` | The safety-rail hooks and the release helper `tools/gh.js` (against a fake GitHub). |
| `tools/gh.js` | Release helper without the gh CLI: `create` (draft pull request), `status`, `merge N --yes` (waits for green CI, refuses on a conflict, merges, waits for Deploy, deletes the branch, syncs main), `cleanup`. Uses the credential git already has and never prints it. |
| `tools/shot.js` | `npm run shot -- --js "openPod(0)" --name x`: screenshots of any screen on the iPhone 15 Pro and the Pixel 9 Pro in `tmp/shots/` (`--lang`, `--dark`, `--after`). |
| `tests/helpers.js` | Shared jsdom setup, a simulated Supabase client, and an answer "solver" for tests. |
