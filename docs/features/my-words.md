# My words

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**⭐ My words** (`view.s="vocab"`, `screenVocab`): search (filters the list in the DOM, no re-render), source filter
(`srcKind` from the saved item's `src`), and 4 practice modes: Flashcards (`screenCards`), Sentence order (needs the
saved sentence tokens `tk`), Meaning quiz, Listen and choose. Practice answers update the saved item's own schedule
(`q.vitem` in `onAnswer`).
