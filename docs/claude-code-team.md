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
| `/release` | Test, upload content, bump the cache version, commit, push |

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
| `release-manager` | Upload, cache version, commit, push | `sw.js`, git |
| `coach` | Improves the team setup from evidence (retrospectives) | `CLAUDE.md`, `.claude/`, `docs/decisions/`, new test checks |
| `security-reviewer` | Secrets, database rules, scripts, sign-in redirect; runs inside `/release` | nothing (read-only) |
| `data-engineer` | Tables, security rules, progress sync, sync tests | `supabase.sql`, `js/sync.js`, `js/content-rows.js`, `tests/sync.test.js`, `normalize()` |

Example: "Use the ui-engineer subagent to add a Hanzi section to the Practise tab, following the kanji section."

## 4. Hooks (run automatically)

| Hook | When | Effect |
|---|---|---|
| `validate-content.js` | After any edit to `content/content.js` | Runs the validator; errors are sent back to Claude Code to fix |
| `guard-release.js` | Before `git commit`, `git push` or `npm run upload` | Runs `npm test`; blocks the command if a test fails |

## 5. Agent teams (optional, experimental, higher cost)

Use only for parallel content work, for example Japanese Level 2 Part 2 and Chinese Level 3 at the same time.
1. Enable: in `~/.claude/settings.json`, add `"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }`. Needs Claude Code v2.1.32 or later.
2. Split the content file first, so each teammate owns different files (for example `content/ja.js` and `content/zh.js`).
   Ask: "Split content/content.js into content/ja.js and content/zh.js, update the loader, tools and tests, and keep
   npm test passing."
3. Then ask for the team: "Create an agent team: one teammate writes Japanese Level 2 Part 2 in content/ja.js, one writes
   Chinese Level 3 Part 1 in content/zh.js, one reviews both with the content-reviewer rules. Use Sonnet for teammates."
4. Review the shared task list with Ctrl+T, then run `/release` yourself.

## 6. Files the team reads and writes

- `ERRORS.md`: one line per content problem you notice in the app.
- `docs/ux-notes.md`: notes from the 5-task phone test after each UI change.
- `docs/decisions/`: one file per decision, so decided questions are not reopened.
- `.github/workflows/test.yml`: GitHub runs `npm test` and `npm run lint` on every push.

## 7. Habits that keep quality high

1. One task per conversation.
2. Approve the plan before the build.
3. Read the final report; it must list tests run, upload result and cache version.
4. Keep `.env` on your computer only.
