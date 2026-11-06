# 0003: No emoji in the interface; one primary action per screen

## Context
Emoji render differently per device and add visual noise; several screens had competing main actions.

## Decision
Line icons only (`ico()` in js/ui.js). One primary button per screen, enforced by the design checks in tests/smoke.js.

## Consequence
`deEmoji()` is a safety net, not a design tool. New screens must be added to the design checks.
