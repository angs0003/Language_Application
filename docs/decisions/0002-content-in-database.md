# 0002: Learning content lives in the database; content/content.js is the master copy

## Context
Content grows to thousands of words and needs updates without republishing the site.

## Decision
`content/content.js` in the repository is the master copy, uploaded with `npm run upload`. The app downloads content after sign-in and keeps a device copy. No AI is called from the browser.

## Consequence
Every content change needs an upload step; the release-manager does it. The validator must pass before upload.
