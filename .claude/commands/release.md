---
description: Test, upload content, bump the cache version, commit and push
---
First use the security-reviewer subagent. Stop if it says "Not safe to release".
Then use the release-manager subagent to release the current changes, following CLAUDE.md section 8.
Before starting, show git status and ask for confirmation if there are changes the owner has not mentioned in this conversation.
