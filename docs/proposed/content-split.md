# Plan: split `content/content.js` (migration step 6)

Status: plan only. It needs one change in `.github/workflows/deploy.yml` (a protected file), so it waits for the owner to name that file. Source: docs/research/agent-architecture.md.

## Problem
`content/content.js` is one 3.2 MB file (about 8,000 lines). Two content branches edit lines near each other (the `JA.push(...)` lines, `PARTS`, `LEVELS`, the end of the file) and conflict. Writers cannot work in parallel without patch files and a serial merge step.

## Proposed layout
`content/` becomes a folder. Each file is a plain script that declares or extends the same globals as today (`ZH`, `JA`, `GR`, ...), in an order set by a manifest.
1. `content/manifest.json`: the ordered list of files, for example `["base.js", "zh/l1.js", "zh/l2.js", "zh/l3p1.js", ..., "ja/l4p5.js", "meta.js", "accent.js"]`.
2. One file per language and level part (about 25 files of 100 to 200 KB): its themes (`const JA5=[...]`), grammar points, chapters and the `push` lines. `base.js` holds the first themes and the constants. `meta.js` holds `PARTS`, `LEVELS`, `VIDS`, `TVREC`, `CASUAL`, `KANA`; `accent.js` holds `ACCENT_JA`.
3. New content is a new file plus one line in the manifest (and one `PARTS` entry), so two writers touch different files.

## What changes
1. `tools/load-content.js` (used by the validator, the round-trip test and the upload tool): concatenate the files in manifest order, then run them as today.
2. `js/loader.js` in bundled mode (tests, no database): load the files from the manifest in order (or one generated bundle).
3. `tools/validate-content.js` and `tools/add-*.js` (`add-word-breaks`, `add-kanji`, `add-accent`): read and write the right file instead of one file (word breaks go to the file that contains the word).
4. `.github/workflows/deploy.yml`: upload content when any file under `content/` changed. The change is one line (`docs/proposed/deploy-content-detect.patch`): `grep -qx "content/content.js"` becomes `grep -q "^content/"`.
5. `sw.js` and `index.html`: the offline cache list and the script tag for bundled mode (a build step would break the no-build rule, so the manifest is read by `loader.js`).
6. `tests/globals.test.js` and the content tests keep passing; a new test fails when a file is missing from the manifest or listed twice.

## Order of work (each one pull request)
1. Add `tools/load-content.js` manifest support and a generated copy of today's file as the first manifest entry (no change of behaviour; the round trip must give identical rows).
2. Cut the file into parts with a script that checks the concatenation equals the old file byte for byte.
3. Switch the tools (`add-*`, validator) to the parts.
4. Owner applies the deploy patch; then remove the old `content/content.js`.

## Risks
1. The database round trip and the offline copy: the rows must be identical before and after (tested by `tools/validate-content.js` round trip and `tests/sync.test.js`).
2. The Deploy workflow must still upload when only a part changed: the test cannot run GitHub Actions, so run the Deploy once by hand with "Upload content" ticked after the change.
3. Order: later files may use names from earlier ones only (the same rule as `APP_FILES`).
4. Effort: large (about 600 lines of tool changes and tests). Confidence about 70% that it works at the first try; the byte-for-byte check and the round trip catch most mistakes.

## Alternative that needs no workflow change
Keep `content/content.js` as a committed, generated file built from `content/src/*.js` by `node tools/build-content.js`, with a test that fails when it is stale. Writers edit different source files; two content pull requests still conflict in the generated file, but the fix is mechanical (merge `main`, run the build). It doubles the stored size (3 MB). Use it if you prefer not to change `deploy.yml`.
