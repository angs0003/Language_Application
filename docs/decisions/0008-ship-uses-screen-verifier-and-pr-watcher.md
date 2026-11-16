# 0008: /ship uses screen-verifier and pr-watcher

## Context
The last review of the agent team (docs/research/agent-architecture.md) found that 5 agents were never used and that 72 of 175 delegations went to general-purpose. /ship ran screenshots and the pull request commands in the main session, although the descriptions of screen-verifier and pr-watcher say they are meant for this work.

## Decision
1. /ship runs screen-verifier for every interface change and puts its table in the pull request description.
2. /ship opens the draft pull request and reads the checks through pr-watcher.
3. Builders (ui-engineer, data-engineer, content-writer) commit to their branch and do not open pull requests.
4. The planner lists the files leased for each planned change.

## Consequence
1. /ship depends on the two agents; if pr-watcher reports BLOCKED, the main session runs tools/gh.js itself.
2. Screenshot and CI polling move from the main session to cheaper models.
3. tests/agents.test.js checks that planner.md asks for a Files leased list and that ship.md names both agents.
