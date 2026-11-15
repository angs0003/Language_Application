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
1. The real protection of `main` is a GitHub ruleset (require a pull request and the `test` check, block force-pushes). The owner has not confirmed that it is on.
2. A script that changes a protected file without naming it in the command is not seen by `guard-files.js`.
3. The guard scripts' first comment line still says "PROPOSED hardened version (see docs/proposed/README.md)". The text is out of date; remove it when the files are next edited with `ALLOW_PROTECTED_EDIT=1`.
4. 21 GitHub Action references are pinned by tag, not by commit ID (supply-chain risk); `tests/workflows.test.js` reports the count.
5. The agents `pr-watcher`, `content-checker`, `screen-verifier`, `docs-keeper`, `a11y-checker`, `dep-scanner` are written but have not been used in a real task yet; check them on the first task.
