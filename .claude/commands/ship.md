---
description: Open a draft pull request, wait for green CI, merge after the owner says so, wait for Deploy, clean up, and summarise
---
Use `tools/gh.js` for every GitHub step (it needs no gh CLI and never prints the credential).

1. Before opening the pull request: `npm test`, `npm run lint` (0 errors) and `npm run test:phone` pass. For a screen you changed, run `/shot` and look at both phone sizes.
2. Write the pull request description in `tmp/pr-body.md` (numbered points: what changed, checks run, limits, `Closes #N` if there is an issue). Do not put secrets or personal data in it.
3. Open the draft pull request: `node tools/gh.js create --title "..." --body-file tmp/pr-body.md`.
4. Check it: `node tools/gh.js status <number>`. If CI is red, fix the cause on the branch and push; never skip or disable a test.
5. STOP until the owner says to merge. Then: `node tools/gh.js merge <number> --yes`. It waits for green CI, refuses on a conflict, marks the pull request ready, merges with a merge commit, waits for the Deploy workflow, deletes the branch (local and remote) and syncs `main`.
6. If the merge is refused because of a conflict: merge `origin/main` into the branch, resolve the conflict, run all checks, push, and run step 5 again.
7. Tell the owner in a short numbered summary: what changed, the pull request link and merge state, the Deploy result, and what was deleted. Leave files and branches that are not yours.

Never push to `main`, never run the content upload, never change `CACHE` in `sw.js` (CLAUDE.md sections 8 and 12). The hooks in `.claude/hooks` block these.
