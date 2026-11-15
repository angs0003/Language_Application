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

## Where to read what

Read this file first. Then read only what the task needs (each file is short):

| Task | Read |
|---|---|
| Any screen, style or interaction | docs/design-rules.md, docs/architecture.md, and the file of the feature in docs/features/README.md |
| Stored data, sync, database | docs/architecture.md (start-up, tables, sync), supabase.sql |
| Content (words, stories, grammar, videos, travel) | docs/content-format.md |
| Which file does what, which test covers what | docs/files.md |
| Research, plans, agent team | docs/research/, docs/claude-code-team.md, docs/decisions/ |
| Several agents or branches at once | docs/parallel-work.md (file leases, docs notes, tests by file, merge queue) |
| Planned work | docs/roadmap.md |

## 3. Design rules (summary; full text in docs/design-rules.md)

1. Bottom tab bar with 4 tabs (Learn, Practise, Listen, Travel); no 5th tab. Language drop-down and profile button in the top bar.
2. One primary action per screen (the highlighted card on tab screens, the right-hand bottom button elsewhere). Back is the left-hand button.
3. Lesson template: close button and progress bar, one content area, Back and Continue. Quiz feedback in the bottom panel (green correct, red incorrect).
4. No emoji in the interface: line icons through `ico(name)`, status marks `STATUS.*`.
5. Components from js/ui.js (`uiCard`, `uiBtn` with pri, sec, link, `uiRow`, ...); every icon-only button needs an `aria-label`.
6. Colour comes from the language (`body[data-lang]`): Japanese indigo, Chinese red. Tabs have no colours of their own. Fonts: Atkinson Hyperlegible; Noto Sans JP/SC for characters.
7. Touch targets at least 44 px; body text 17 px.
8. No timers, no auto-advance, no streak loss, no leaderboards, no flashing or animation.
9. Literal feedback, "I do not know" on every question, Check answer before any result, Back to see earlier answers.
10. Tapping a word opens a callout with its reading and meaning and reads it aloud; the star on the New word card saves it.
11. Light and dark mode through the tokens. Use ’ and “ ” in visible text.

## 4. Files (full table in docs/files.md)

`index.html` (page shell and all CSS), `js/*.js` (app files; shared global scope, loaded in the order of `APP_FILES` in js/loader.js; a file may use at load time only names from earlier files), `content/content.js` (master copy of all content), `tools/`, `tests/`, `docs/`, `.claude/` (agents, commands, hooks).
Never commit `.env`; never put the service key in browser code; do not change `CACHE` in `sw.js` (the Deploy workflow sets it).

## 5. App architecture (details in docs/architecture.md and docs/features/)

- Progress state `S` is saved with `save()` after any change and loaded through `normalize()`. **Any new progress field must be added to `stateRows`, `mergeRemote` and `normalize()`.**
- `render()` (js/ui.js) calls one `screenX()` per view (`view.s`); buttons use `data-a="${A(fn)}"`.
- AI: `AI_OFF=true`. Never call AI APIs from the browser.

## 6. Content format (docs/content-format.md)

Key rules: literal language (no idioms, metaphors or sarcasm); spoken register (friends use plain form, staff and strangers polite); no duplicate words within a language; every Japanese kanji must exist in `KANJI_JA`; every word has an example with word breaks; chapters equal themes. `npm test` validates the structure.

## 7. How to add a content part (docs/content-format.md)

The steps for a part of 150 words (themes, grammar points, chapters, kanji, word breaks, checks) are in docs/content-format.md; the `/add-part` command follows them.

## 8. Definition of done (every change)

1. `npm test` passes (content check, round trip, smoke, sync, features and kanji tests), `npm run lint` reports no errors,
   and `npm run test:phone` passes (first time on a computer: `npx playwright install chromium`).
2. No design rule in docs/design-rules.md is broken.
3. New visible text is literal and uses the existing terms.
4. Changes are committed to a branch (never to `main`) and a pull request to `main` is open. Never push to `main`.
   Do not change `CACHE` in `sw.js` and do not run `npm run upload`: the Deploy workflow does both after the merge.
5. Tell the owner what changed, in numbered points, with the pull request link. The owner merges after the `test` check is green.
6. For a UI change: look at screenshots (`/shot`) in both languages and at both phone sizes, and test every screen where the feature appears. A new screen is added to `tests/phone/screens.js`.

## 9. Team setup in .claude/

Commands (`.claude/commands/`): `/add-part`, `/check-content`, `/design-check`, `/release`, `/add-video`, `/curate-videos`,
`/retro`, `/maintain`, `/ux-review`, `/content-report` (local only), `/content-gaps` (safe for public logs), `/ship` (pull request, CI, merge after the owner says so, cleanup),
`/shot` (screenshots of any screen at the phone sizes).
Subagents (`.claude/agents/`, 16, each with a `model:` line: opus for `planner`, `researcher`, `coach`, `content-reviewer`; haiku for `test-runner`, `pr-watcher`, `content-checker`, `a11y-checker`, `dep-scanner`; sonnet for the rest): `planner` (read-only; writes the plan before any change), `researcher` (web research with sources; writes only `docs/research/`), `content-writer`, `content-checker` (runs the automatic content checks), `content-reviewer` (naturalness and consistency on a sample, at most 2 rounds), `screen-verifier` (screenshots against the design rules), `a11y-checker` (axe accessibility check on every screen), `dep-scanner` (outdated and vulnerable dependencies), `docs-keeper` (the only agent that edits CLAUDE.md and shared docs, from notes in `tmp/doc-notes/`),
`ui-engineer`, `test-runner`, `pr-watcher` (opens a draft pull request and reports checks; never merges), `coach`, `security-reviewer` (runs inside `/release`), `video-curator`
(checks videos and writes the VIDS entry text; read-only, the content-writer adds approved entries), `data-engineer` (owns supabase.sql, js/sync.js, normalize() defaults and the sync tests).
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
Guide for the owner: `docs/claude-code-team.md`. Keep these files consistent with docs/design-rules.md, docs/content-format.md and sections 8 and 12 when rules change.

## 10. Roadmap

See docs/roadmap.md (content batches, feature batches, open content task, ideas not built).

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
