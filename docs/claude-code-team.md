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

Improvement commands:

| Command | Cadence | Use it for |
|---|---|---|
| `/retro` | after every release | Proposes edits to the handbook, agents, commands and checks, with evidence |
| `/maintain` | monthly | Dependency and tool versions, dead code, documentation drift |
| `/ux-review` | quarterly | Research, design audit, ranked UI/UX proposals (wireframes before code) |
| `/content-report` | monthly | Your progress, weak themes, content gaps, open errors |

## 3. Subagents (Claude Code picks them by task, or name them)

| Subagent | Job | Can edit |
|---|---|---|
| `content-writer` | Writes content parts | `content/` only |
| `content-reviewer` | Reviews content for correctness and consistency | nothing (read-only) |
| `ui-engineer` | Screens, components, styles; keeps the design rules | `js/`, `index.html` |
| `test-runner` | Runs tests and explains failures | nothing |
| `release-manager` | Tests, commit to a branch, push the branch, open a pull request | git (never `main`) |
| `coach` | Improves the team setup from evidence (retrospectives) | `CLAUDE.md`, `.claude/`, `docs/decisions/`, new test checks |
| `security-reviewer` | Secrets, database rules, scripts, sign-in redirect; runs inside `/release` | nothing (read-only) |
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

- `ERRORS.md`: one line per content problem you notice in the app.
- `docs/ux-notes.md`: notes from the 5-task phone test after each UI change.
- `docs/decisions/`: one file per decision, so decided questions are not reopened.
- `.github/workflows/test.yml`: GitHub runs `npm test`, `npm run lint` and the phone tests (`npm run test:phone`) on every pull request.
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
