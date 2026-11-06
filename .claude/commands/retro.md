---
description: Retrospective after a release: what to change in CLAUDE.md, the agents, the commands and the tests
---
Run a retrospective for the last release of Language Steps, using the coach subagent.
Evidence to read: git log since the previous release (git log --oneline -30), docs/ux-notes.md, open issues (gh issue list --state open), and any test failures or hook blocks mentioned in this conversation.
For each proposal give: the evidence (what went wrong or was repeated), the exact edit (file, old text, new text), and the expected effect.
Allowed targets: CLAUDE.md, .claude/agents/*.md, .claude/commands/*.md, tests/*.js (new checks only).
Show all proposals as a numbered list and wait for my approval before editing. After approval, apply only the approved items and run npm test.
