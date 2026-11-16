# Working with Claude Code on Language Steps

This repository is set up so Claude Code works like a small team. Everything below is in the `.claude/` folder,
so it travels with the repository.

## 1. Start every session the same way

```bash
cd language-steps
claude
```
Then type: `Read CLAUDE.md, then <your request>.` Press Shift+Tab to use plan mode for anything bigger than a
small fix, approve the plan, then let Claude Code build. Use `/clear` to start a new task.

## 2. Commands (type them in the Claude Code prompt)

| Command | Use it for |
|---|---|
| `/add-part ja 2 2` | Write Japanese Level 2, Part 2 (150 words, 10 grammar points, 15 chapters), reviewed and tested, not released |
| `/check-content` | Validate and review content without changing it |
| `/design-check` | Check changed screens against the design rules |
| `/release` | Security check, tests, commit to a branch, open a pull request (you merge; the Deploy workflow publishes) |
| `/ship` | Draft pull request through pr-watcher (after screen-verifier for a screen change), CI result, merge after you say so, Deploy, docs, cleanup |
| `/add-video` | Add one video you chose to the catalogue, after the video-curator checks it |
| `/curate-videos` | Find and check new catalogue videos for a level |

Improvement commands:

| Command | Cadence | Use it for |
|---|---|---|
| `/retro` | after every release | Proposes edits to the handbook, agents, commands and checks, with evidence |
| `/maintain` | monthly | Dependency and tool versions, dead code, documentation drift |
| `/ux-review` | quarterly | Research, design audit, ranked UI/UX proposals (wireframes before code) |
| `/content-report` | monthly, on your computer only | Your progress, weak themes, content gaps, open errors (reads your personal progress) |
| `/content-gaps` | monthly, automatic | Missing content and open content-error issues; no personal data |

## 3. Subagents (Claude Code picks them by task, or name them)

| Subagent | Job | Can edit |
|---|---|---|
| `planner` | Writes the plan before any change; posts it on the issue when Claude runs in GitHub | nothing (read-only) |
| `a11y-checker` | Runs the axe accessibility check (WCAG 2.2 A and AA) on every screen, both languages, light and dark (haiku) | nothing (read-only) |
| `dep-scanner` | Reports outdated and vulnerable dependencies with dates and risk (haiku) | nothing (read-only) |
| `docs-keeper` | Applies doc notes to CLAUDE.md and the shared docs; keeps terms and the size limit | `CLAUDE.md`, `docs/*.md`, `docs/features/` |
| `researcher` | Researches learning methods and technology practice with sources (`/research`) | `docs/research/` only |
| `content-writer` | Writes content parts | `content/` only |
| `content-checker` | Runs every automatic content check and lists findings (haiku) | nothing (read-only) |
| `content-reviewer` | Reviews naturalness, register, consistency and level fit on a sample (opus) | nothing (read-only) |
| `screen-verifier` | Screenshots on both phones in both languages, checked against the design rules | `tmp/shots/` only |
| `ui-engineer` | Screens, components, styles; keeps the design rules | `js/`, `index.html` |
| `test-runner` | Runs tests and explains failures | nothing |
| `pr-watcher` | Pushes the branch, opens a draft pull request with `tools/gh.js`, reports the checks (haiku); never merges | `tmp/pr-body.md` only |
| `coach` | Improves the team setup from evidence (retrospectives) | `CLAUDE.md`, `.claude/`, `docs/decisions/`, new test checks |
| `security-reviewer` | Secrets, database rules, scripts, sign-in redirect; runs inside `/release` | nothing (read-only) |
| `video-curator` | Finds and checks YouTube videos against fixed rules and writes the entry text; the content-writer adds approved ones | nothing (read-only) |
| `data-engineer` | Tables, security rules, progress sync, sync tests | `supabase.sql`, `js/sync.js`, `js/content-rows.js`, `tests/sync.test.js`, `normalize()` |

Example: "Use the ui-engineer subagent to add a Hanzi section to the Practise tab, following the kanji section."

## 4. Hooks (run automatically)

| Hook | When | Effect |
|---|---|---|
| `validate-content.js` | After any edit to a content part (`content/parts/*.js`) or `content/manifest.js` | Runs the validator; errors are sent back to Claude Code to fix |
| `guard-release.js` | Before every shell command | Runs `npm test` before a commit or push (the result is remembered for the exact working tree, so a commit and a push of the same files run it once); blocks a failing suite. It also blocks a push to `main` (also behind `git -C`, `bash -c`, `sh -c`, `eval`, `$(...)`), `git push --all` and `--mirror`, force-pushes, a commit on `main`, and the content upload from your computer (the Deploy workflow uploads). |
| `guard-files.js` | Before an edit with the Edit or Write tool, and before every shell command | Blocks edits to `.env*`, `.github/workflows/*`, `.claude/settings*.json`, the guard scripts and `CACHE` in `sw.js`, and shell commands that name one of them and could write (redirect, `tee`, `sed -i`, `cp`, `mv`, `rm`, a script with `writeFile`, `git checkout`, and similar). Reading, `git diff`, `git add` and `git commit` stay allowed. You allow one edit by starting Claude Code with `ALLOW_PROTECTED_EDIT=1`. |

## 5. Agent teams (optional, experimental, higher cost)

Use only for parallel content work, for example Japanese Level 2 Part 2 and Chinese Level 3 at the same time.
1. Enable: in `~/.claude/settings.json`, add `"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }`. Needs Claude Code v2.1.32 or later.
2. The content is already split into parts (`content/parts/`), so each teammate owns a different part file (docs/parallel-work.md).
3. Ask for the team: "Create an agent team: one teammate writes Japanese Level 4 Part 6 in a new part file (for example content/parts/ja-part-15.js), one writes
   Chinese Level 4 Part 5 in a new part file (for example content/parts/zh-level4-part5.js), one checks both with the content-checker and content-reviewer rules. Use Sonnet for teammates."
4. Review the shared task list with Ctrl+T, then run `/release` yourself and merge the pull request.

## 6. Files the team reads and writes

- GitHub issues: one issue per content problem (template **Content error**, label `content-error`). `ERRORS.md` now only points to them.
- `docs/ux-notes.md`: notes from the 5-task phone test after each UI change.
- `docs/decisions/`: one file per decision, so decided questions are not reopened.
- `.github/workflows/test.yml`: GitHub runs `npm test`, `npm run lint` and the phone tests (`npm run test:phone`) on every pull request.
- `.github/workflows/dictionary.yml`: when a pull request changes content, GitHub checks every word's reading against
  CC-CEDICT and JMdict and posts the report as a comment. Report only. On your computer: `npm run dict:get` once, then `npm run dict`.
- `.github/workflows/deploy.yml`: after a merge to `main`, GitHub tests again, uploads content (only if a file under `content/` changed),
  sets the cache version and publishes the app. If any step fails, nothing is published.

## 7. Habits that keep quality high

1. One task per conversation.
2. Approve the plan before the build.
3. Read the final report; it must list tests run and the pull request link.
4. Merge only when the pull request shows a green `test` check. To undo a release, open the merged pull request
   on GitHub and tap **Revert**, then merge the revert pull request.
5. Keep `.env` on your computer only. The copy of the service key for the Deploy workflow lives in GitHub secrets.

## 8. How a change goes live

1. Claude Code works on a branch and opens a pull request (`/release`).
2. GitHub runs the `test` check on the pull request.
3. You read the pull request and merge it when `test` is green. This is the only manual step.
4. The Deploy workflow runs on `main`: test → upload content if it changed → set `CACHE` → publish to GitHub Pages.
5. The app shows the change 1 to 3 minutes after the merge, at its next start.
6. If the Deploy workflow fails: open **Actions** on GitHub, read the failed step, fix it in a new pull request,
   or run the workflow again with **Run workflow** (tick "Upload content" to force a content upload).

### One-time GitHub setup (in this order)

1. **Secrets:** Settings → Secrets and variables → Actions → **New repository secret**. Add `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` with the same values as in your `.env`.
2. **Merge the pull request** that adds `deploy.yml`. Until step 3, the site still updates from the branch.
3. **Pages source:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. Then open
   Actions → Deploy → **Run workflow** once, to publish through the new workflow.
4. **Protect main:** Settings → Rules → Rulesets → New branch ruleset. Target: the default branch.
   Turn on **Require a pull request before merging** (required approvals: 0, because you are the only person)
   and **Require status checks to pass**, add the check `test`. Turn on **Block force pushes**.

## 9. Working from GitHub (your phone is enough)

Claude can work without your computer. It uses your work Claude seat through the secret `CLAUDE_CODE_OAUTH_TOKEN`.
Everything in this repository is public, including Claude's comments and the Actions logs.

| You do | What happens |
|---|---|
| New issue → **Content error**, then comment `@claude fix this` | Small fix: Claude makes a branch and a pull request. Larger change: Claude posts a plan first |
| New issue → **Feature or change**, then comment `@claude plan this` | The planner posts a plan with assumptions, files, tests and risks |
| Comment `@claude approved` | Claude builds the plan on a branch and opens a pull request (`Closes #N`) |
| Comment `@claude <change>` on a pull request | Claude changes that pull request |
| Open a pull request (or Claude opens one) | **Review** posts one comment: security, design rules, content checks, "Ready to merge" or not |
| Nothing (1st of every month) | **Monthly** opens 2 issues: maintenance report and content gaps report. Comment `@claude do items 1 and 3` to act |
| Merge a pull request with a green `test` check | **Deploy** publishes it |

If Claude replies with a link named "Create PR" instead of opening the pull request, tap the link, then tap **Create pull request**.

Limits per run: 40 turns and 30 minutes for `@claude` work, 25 turns and 20 minutes for reviews (Sonnet). Only one Claude run at a time.
Each run uses your seat's usage limit. If the limit is reached, the run fails; run it again later from Actions or comment again.

### One-time setup

1. On your computer, signed in to Claude Code with your work seat, run `claude setup-token`. Copy the token it prints.
2. GitHub → Settings → Secrets and variables → Actions → **New repository secret**: name `CLAUDE_CODE_OAUTH_TOKEN`, paste the token.
3. Check that the Claude GitHub App is installed on this repository (it is needed for `@claude`).
4. The labels `content-error`, `feature`, `maintenance` and `content-gaps` already exist (Issues → Labels).
5. Test it: create a **Content error** issue for a real or invented small problem and comment `@claude fix this`.
