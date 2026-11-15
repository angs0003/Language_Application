---
description: Check changed screens against the design rules
argument-hint: [screen or file name]
---
Check the interface against docs/design-rules.md for: $ARGUMENTS (if empty, check all files changed since the last commit).
Use the screen-verifier subagent: it takes screenshots of the screens and checks them; it must not edit files in this command.
For each screen report: primary actions found (must be 1), emoji found (must be 0), icon buttons without aria-label (must be 0), touch targets under 44 px, and any component or colour not from js/ui.js or the tokens.
Then run node tests/smoke.js and report its design checks, and use the a11y-checker subagent (axe, WCAG 2.2 A and AA, both languages, light and dark) and report its violations.
