# 0005: Claude works from GitHub issues, reviews pull requests and reports monthly

## Context
The team worked only while the owner ran commands in a terminal. Content errors were collected in ERRORS.md, which nothing watched.

## Decision
1. `@claude` in an issue or comment starts work (`claude.yml`). Anything larger than a small fix starts with a plan from the `planner` subagent; Claude builds only after `@claude approved`.
2. Every non-draft pull request gets an automatic review (`review.yml`, Sonnet, comment only).
3. On the 1st of every month, `/maintain` and `/content-gaps` each open an issue (`monthly.yml`). They change no files.
4. Content errors are issues with the label `content-error`. ERRORS.md points to them.
5. Login is the owner's subscription token (`CLAUDE_CODE_OAUTH_TOKEN`). The Claude workflows never get the Supabase secrets, and personal progress is never read in GitHub Actions, because the repository and its logs are public.

## Consequence
The owner only writes issues, approves plans and merges. Each run uses the owner's seat usage limit. Automatic reviews on every pull request cost usage; switch to on-request review by removing the `pull_request` trigger in review.yml.
