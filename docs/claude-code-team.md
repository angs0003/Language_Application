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
| `content-writer` | Writes content parts | `content/` only |
| `content-reviewer` | Reviews content for correctness and consistency | nothing (read-only) |
| `ui-engineer` | Screens, components, styles; keeps the design rules | `js/`, `index.html` |
| `test-runner` | Runs tests and explains failures | nothing |
| `release-manager` | Tests, commit to a branch, push the branch, open a pull request | git (never `main`) |
| `coach` | Improves the team setup from evidence (retrospectives) | `CLAUDE.md`, `.claude/`, `docs/decisions/`, new test checks |
| `security-reviewer` | Secrets, database rules, scripts, sign-in redirect; runs inside `/release` | nothing (read-only) |
| `video-curator` | Finds and checks YouTube videos against fixed rules; adds approved ones | `VIDS` and `TVREC` in `content/content.js` |
| `data-engineer` | Tables, security rules, progress sync, sync tests | `supabase.sql`, `js/sync.js`, `js/content-rows.js`, `tests/sync.test.js`, `normalize()` |

Example: "Use the ui-engineer subagent to add a Hanzi section to the Practise tab, following the kanji section."

## 4. Hooks (run automatically)

| Hook | When | Effect |
|---|---|---|
| `validate-content.js` | After any edit to `content/content.js` | Runs the validator; errors are sent back to Claude Code to fix |
| `guard-release.js` | Before `git commit`, `git push` or `npm run upload` | Runs `npm test`; blocks the command if a test fails. (`npm run upload` from your computer is now only an emergency route; the Deploy workflow normally uploads.) |

## 5. Agent teams (optional, experimental, higher cost)

Use only for parallel content work, for example Japanese Level 2 Part 2 and Chinese Level 3 at the same time.
1. Enable: in `~/.claude/settings.json`, add `"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }`. Needs Claude Code v2.1.32 or later.
2. Split the content file first, so each teammate owns different files (for example `content/ja.js` and `content/zh.js`).
   Ask: "Split content/content.js into content/ja.js and content/zh.js, update the loader, tools and tests, and keep
   npm test passing."
3. Then ask for the team: "Create an agent team: one teammate writes Japanese Level 2 Part 2 in content/ja.js, one writes
   Chinese Level 3 Part 1 in content/zh.js, one reviews both with the content-reviewer rules. Use Sonnet for teammates."
4. Review the shared task list with Ctrl+T, then run `/release` yourself and merge the pull request.

## 6. Files the team reads and writes

- GitHub issues: one issue per content problem (template **Content error**, label `content-error`). `ERRORS.md` now only points to them.
- `docs/ux-notes.md`: notes from the 5-task phone test after each UI change.
- `docs/decisions/`: one file per decision, so decided questions are not reopened.
- `.github/workflows/test.yml`: GitHub runs `npm test` and `npm run lint` on every pull request.
- `.github/workflows/dictionary.yml`: when a pull request changes content, GitHub checks every word's reading against
  CC-CEDICT and JMdict and posts the report as a comment. Report only. On your computer: `npm run dict:get` once, then `npm run dict`.
- `.github/workflows/deploy.yml`: after a merge to `main`, GitHub tests again, uploads content (only if `content/content.js` changed),
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
