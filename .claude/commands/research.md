---
description: Research one topic (learning method or technology) with sources, compare with the app, propose ranked changes (no code changes)
---
Run the `researcher` subagent on the topic in $ARGUMENTS (for example "spaced repetition", "listening practice", "PWA offline", "accessibility"). With no topic, research the whole app: learning methods and technology.
1. The subagent writes `docs/research/<topic>.md` in the format in its instructions.
2. Summarise for the owner in numbered points: the answer, the top 3 proposals with effort, and the questions that need the owner's decision.
3. Do not change code. The owner picks items; then the normal plan, build, test and pull request flow applies.
