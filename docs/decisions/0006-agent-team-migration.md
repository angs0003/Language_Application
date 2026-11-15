# 0006: Agent team migration (November 2026)

Status: done. Source: docs/research/agent-architecture.md (Opus review of the agent team).

## Decision
Make the agent team cheaper, narrower and able to work in parallel, in 8 small pull requests. The owner approved every step in the conversation, including the steps that change protected files (guards, settings, workflows).

## What was done
1. Every subagent has a `model:` line (opus for planning, research, coaching and content review; haiku for mechanical work; sonnet for the rest). Output and "done when" lines in every agent. `tests/agents.test.js` checks them.
2. New roles: `pr-watcher` (replaces `release-manager`), `content-checker` and a narrower `content-reviewer`, `screen-verifier`, `docs-keeper`, `a11y-checker`, `dep-scanner`; `video-curator` is read-only. 16 agents.
3. `CLAUDE.md` is a short core (about 12 KB, was 47 KB); details are in `docs/` (design rules, architecture, one file per feature, content format, files, roadmap, parallel work).
4. Parallel rules (docs/parallel-work.md): file leases, doc notes, tests by file, a serial merge queue. `tests/globals.test.js` catches duplicate global names; `npm test` runs every `tests/*.test.js` file (`tests/run-all.js`).
5. Accessibility test with axe on every screen (`tests/phone/a11y.spec.js`).
6. Workflows: the monthly reports run on Sonnet, `test.yml` has explicit permissions, `deploy.yml` uploads when any file under `content/` changed, `queue-labels.yml` sets the work queue labels (no AI). `tests/workflows.test.js` checks them.
7. The content file is split into parts (`content/parts/`, order in `content/manifest.js`); one new part is one new file plus one manifest line.
8. Harder guards: `git -C`, `bash -c`, `sh -c`, `eval`, `$(...)`, `--all`, `--mirror` and `+branch` pushes are blocked; Bash writes to protected files are blocked; the test result is remembered for the exact working tree. Cases are in `tests/hooks.test.js`.

## Limits and open points
1. The real protection of `main` is a GitHub ruleset. Checked on 15 November 2026 through the API: "Protect main" is active on the default branch, has no bypass actor, blocks deletion and force-pushes and requires the `test` check.
2. A script that changes a protected file without naming it in the command is not seen by `guard-files.js`. Running `node tools/pin-actions.js --write` is such a case; the owner ran it in a terminal.
3. Done: the "PROPOSED hardened version" wording is removed from the two guard scripts and `docs/proposed/` is deleted.
4. Done: all 21 GitHub Action references are pinned by commit ID (`tools/pin-actions.js`; the tag stays in a comment). `tests/workflows.test.js` reports the number that are still pinned by tag (now 0). To move a pin to a newer release, run `node tools/pin-actions.js` after changing the tag in the workflow.
5. Done: the agents `pr-watcher`, `content-checker`, `screen-verifier`, `docs-keeper`, `a11y-checker` and `dep-scanner` were used on read-only trial tasks on 15 November 2026; their definitions were corrected from the findings.
