---
description: Open a draft pull request, wait for green CI, merge after the owner says so, wait for Deploy, clean up, and summarise
---
Use `tools/gh.js` for every GitHub step (it needs no gh CLI and never prints the credential).

1. Before opening the pull request: `npm test`, `npm run lint` (0 errors) and `npm run test:phone` pass. For an interface change (a change in `js/` or `index.html` that changes a screen), run the `screen-verifier` subagent with the names of the changed screens from `tests/phone/screens.js`; it must report "All screens pass" before step 2. Put its table in the pull request description.
2. Write the pull request description in `tmp/pr-body.md` (numbered points: what changed, checks run, limits, `Closes #N` if there is an issue). Do not put secrets or personal data in it.
3. Open the draft pull request with the `pr-watcher` subagent: give it the branch name. It pushes the branch, runs `node tools/gh.js create --title "..." --body-file tmp/pr-body.md` and reports the pull request number, link and check state. Run `gh.js create` yourself only if pr-watcher reports BLOCKED.
4. Check it: pr-watcher reports the checks; for a later check run pr-watcher again with "status only, pull request <number>". If CI is red, fix the cause on the branch and push; never skip or disable a test.
5. STOP until the owner says to merge. Then: `node tools/gh.js merge <number> --yes`. It waits for green CI, refuses on a conflict, marks the pull request ready, merges with a merge commit, waits for the Deploy workflow, deletes the branch (local and remote) and syncs `main`.
6. If the merge is refused because of a conflict: merge `origin/main` into the branch, resolve the conflict, run all checks, push, and run step 5 again.
7. Docs (do not skip): after the Deploy result, run the `docs-keeper` subagent on a new branch `chore/docs-<topic>`. Give it the builder's "Doc note" (see the builders' final reports) or, if there is none, the merged commit ids to compare with the code (`git diff <before>..<after>`). It updates `docs/features/`, `docs/architecture.md`, `docs/files.md` and, if needed, `CLAUDE.md`. Check its facts against the code yourself, commit, open a draft pull request with steps 3 and 4, and merge it only after the owner says so (step 5). A change with no visible feature (for example only a content fix) needs no docs pull request: say so in the summary.
8. Tell the owner in a short numbered summary: what changed, the pull request link and merge state, the Deploy result, and what was deleted, and the docs pull request. Leave files and branches that are not yours.

Several pull requests at once (merge queue, docs/parallel-work.md): merge one at a time, oldest first, each only after the owner said to merge it. After each merge, for the next branch: `git merge origin/main`, `npm test` (and `npm run test:phone` for interface changes), push, `node tools/gh.js status <number>`, then merge. Do not merge the next one while the previous Deploy is running.

Never push to `main`, never run the content upload, never change `CACHE` in `sw.js` (CLAUDE.md sections 8 and 12). The hooks in `.claude/hooks` block these.
