# 0007: Placement quiz Option A, two parts

## Context
The old placement quiz tested only word knowledge. Word knowledge alone is not a fair assessment of a learner's level.

## Decision
Option A: the quiz has two parts.
1. Words decide the word range.
2. Sentences decide the starting theme.
3. The word result is the upper limit for the sentence part.
4. At most 14 questions: 8 for words and 6 for sentences.

## Consequence
1. The tests (tests/placement.test.js) cover the answer chances of the tile question types and allow a tolerance of 1 theme at the two ends of the list.
2. Details of the behaviour are in docs/features/placement-quiz.md.
