# 0004: Publish only through the Deploy workflow, after a pull request is merged

## Context
GitHub Pages published every push to `main` directly from the branch, even when the Tests workflow failed.
Content upload and the cache version were manual steps on the owner's computer, so cloud agents could not
release and a forgotten step left phones on old files.

## Decision
1. Agents work on a branch and open a pull request. `main` accepts changes only through a pull request with a green `test` check.
2. The owner merges. `.github/workflows/deploy.yml` then tests, uploads content if `content/content.js` changed,
   sets `CACHE` in `sw.js` to `ls-<commit ID>`, and publishes only the served files to GitHub Pages (source: GitHub Actions).
3. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are GitHub secrets, used only in the upload step.

## Consequence
Nothing reaches the app without passing tests and the owner's merge. Nobody edits `CACHE` by hand.
If publishing fails after a successful upload, the database has newer content than the site until the workflow runs again.
The service key exists in GitHub secrets as well as `.env`; branch protection limits who can change workflows on `main`.
