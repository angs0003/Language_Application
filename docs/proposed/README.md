# Proposed changes that need the owner

These changes touch protected files (the safety rails, the GitHub workflows, `.claude/settings.json`). The guards and the permission check stop an agent from editing them, so the changes are prepared here, tested where possible, and **not active**. Each one has an exact command. Apply a change only after you read it. Source: docs/research/agent-architecture.md, migration steps 5, 6 and 7.

## Step 5: harder safety rails (tested, ready)

Files: `guards/guard-release.js`, `guards/guard-files.js`, `guards/settings.json`. Tested by `tests/proposed-guards.test.js` (part of `npm test`).
What it fixes (each was tested as a real bypass of the active guards):
1. `git -C . push origin main`, `git -c x=y push origin main` and `git --no-pager push origin main` were not recognised as pushes.
2. `bash -c 'git push origin main'`, `sh -c "..."`, `eval "..."` and `$(...)` were not read; `git push --all` and `--mirror` (they push `main`) were allowed; `git push origin +branch` (a force-push) was allowed.
3. `guard-files.js` did not look at Bash at all, so `sed -i .github/workflows/test.yml`, `cp x .claude/settings.json` or `echo x > .env` were allowed. Now a Bash command that names a protected path and can write (redirect, tee, sed -i, cp, mv, rm, a script with writeFile, git checkout or restore, python, and similar) is blocked; reading (cat, grep, git diff, git add, git commit) is allowed.
4. `npm test` ran before every commit and again before every push (about 1 minute each). The result is now remembered for the exact contents of the working tree (tracked and untracked files), so a commit followed by a push of the same files runs the suite once. A failing suite is never remembered.
To apply (run in the repository folder, in your own terminal):
```
cp docs/proposed/guards/guard-release.js .claude/hooks/guard-release.js
cp docs/proposed/guards/guard-files.js .claude/hooks/guard-files.js
cp docs/proposed/guards/settings.json .claude/settings.json
```
Then move the cases of `tests/proposed-guards.test.js` section 2 and 3 into `tests/hooks.test.js` and delete `tests/proposed-guards.test.js`. After this, an agent can no longer edit workflows or the rails from the shell; you allow one edit by starting Claude Code with `ALLOW_PROTECTED_EDIT=1`. Limit: a script that changes a protected file without naming it in the command (for example `node tmp/x.js` that contains the path) is still not seen. The real protection is the GitHub ruleset on `main` (require a pull request and the `test` check, block force-pushes): please confirm it is on.

## Step 7: cheaper reports and a work queue (APPLIED by the owner's permission; the files here are kept as the record)

1. `monthly-model.patch`: the monthly reports run on Sonnet (`--model sonnet`) and may use `npm view` (the dep-scanner needs it). Apply: `git apply docs/proposed/monthly-model.patch`.
2. `queue-labels.yml`: a workflow without AI that keeps one label on each issue: `needs-plan`, `plan-posted`, `approved`, `pr-open` (plus `needs-owner` and `size:small` set by hand). The text of comments is passed in environment variables, never in a command. Apply: `git mv docs/proposed/queue-labels.yml .github/workflows/queue-labels.yml`.
3. `test-permissions.patch`: the `test` workflow sets `permissions: contents: read` (it had none, so it used the repository default). Apply: `git apply docs/proposed/test-permissions.patch`, then remove `.github/workflows/test.yml` from `KNOWN_NO_PERMISSIONS` in `tests/workflows.test.js`.
`tests/workflows.test.js` checks the active and the proposed workflows (valid YAML, no `pull_request_target`, no comment or title text inside a `run:` command, explicit permissions).

## Step 6: split `content/content.js`

See `content-split.md`. The one protected change, `deploy-content-detect.patch` (upload when any file under `content/` changed), is APPLIED; it is harmless before the split.
