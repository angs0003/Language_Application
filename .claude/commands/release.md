---
description: Security check, tests, commit to a branch and open a pull request (the Deploy workflow publishes after the merge)
---
First use the security-reviewer subagent. Stop if it says "Not safe to release".
Then use the release-manager subagent to prepare the current changes as a pull request, following CLAUDE.md section 8.
Before starting, show git status and ask for confirmation if there are changes the owner has not mentioned in this conversation.
After the pull request is open, tell the owner: "Merge the pull request on GitHub after the Tests check is green. The Deploy workflow then uploads content, sets the cache version and publishes."
