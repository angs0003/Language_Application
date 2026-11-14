# Research: technology best practice compared with Language Steps

Date: 2026-11-14. Scope: PWA, accessibility, performance, security, Web Speech API, privacy, testing, sync. Read-only research; no app file was changed.

## 1. Answer in 3 lines

1. The app already follows most current practice (RLS on every table, anon key only in the browser, no timers, 44 px targets, reduced-motion rule, pinned library version, read-only default workflow permissions). Confidence about 80%.
2. The largest risks are: no data-loss safeguard for the offline copy (no `navigator.storage.persist()`, 3.2 MB content stored twice), no Content-Security-Policy and no integrity check on the CDN script, GitHub Actions pinned to tags and not to commit IDs, and speech that depends entirely on device voices with no check or fallback message. Confidence about 75%.
3. The cheapest improvements are small: request persistent storage, add a CSP meta tag and SRI, pin actions with Dependabot, add axe to the Playwright tests, add an "update available" notice, and add an account data export/delete route.

## 2. Findings

Each finding: statement, source, evidence kind, confidence.

### PWA

F1. `skipWaiting()` plus `clients.claim()` can make a page load some files from the old worker and some from the new one, which can break a site. The web.dev author advises against `skipWaiting` when that can happen. Source: https://web.dev/articles/service-worker-lifecycle. Evidence: official documentation. Confidence about 85%.

F2. Caching strategy depends on the resource: cache-first for hash-versioned immutable assets, network-first for HTML and data, stale-while-revalidate for content that tolerates brief staleness. Source: https://developer.chrome.com/docs/workbox/caching-strategies-overview. Evidence: official documentation. Confidence about 85%.

F3. Safari deletes all script-writable storage (IndexedDB, localStorage, service worker registrations and caches) after 7 days of Safari use without interaction with the site. Web apps added to the Home Screen have their own counter and are not expected to lose data. Source: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/. Evidence: official vendor documentation (WebKit). Confidence about 85%.

F4. Storage quota in Safari on iOS 17 and later is about 60% of disk per origin (Home Screen apps use the same quota). Under disk pressure the least recently used origin is evicted whole, unless persistent storage was granted. `navigator.storage.persist()` is granted or denied automatically in Safari and Chromium from interaction history, with no prompt. `localStorage` is limited to 5 MiB per origin and throws `QuotaExceededError` above that. Source: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria. Evidence: official documentation. Confidence about 85%.

F5. Installability on Chromium needs a manifest with name, 192 px and 512 px icons, `start_url`, `display`, and HTTPS. A service worker is not required for installation. `beforeinstallprompt` is not supported on iOS; from iOS 16.4 the Share menu installs from Safari, Chrome, Edge and Firefox. Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable. Evidence: official documentation. Confidence about 85%. (Manifest members `id`, `screenshots` and separate maskable icons are general knowledge, not confirmed on that page; confidence about 70%.)

### Accessibility

F6. WCAG 2.2 adds: 2.4.11 Focus Not Obscured (AA), 2.5.7 Dragging Movements (AA), 2.5.8 Target Size Minimum (AA), 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication Minimum (AA). Source: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/. Evidence: standard. Confidence about 90%.

F7. Target Size Minimum is 24 x 24 CSS px (with spacing exceptions); the stricter 44 x 44 px measure is the separate "Enhanced" criterion. The app's 44 px rule exceeds the AA requirement. Source: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html. Evidence: standard. Confidence about 85%.

F8. W3C COGA "Making Content Usable" lists 8 objectives: understand what things are, find what is needed, clear content, avoid and correct mistakes, help users focus, no reliance on memory, help and support, personalization. Patterns include no unexpected movement, ability to go back, no timeouts, step-by-step instructions, and simplified views or user-controlled changes. It is supplemental to WCAG and not a conformance requirement. Source: https://www.w3.org/TR/coga-usable/. Evidence: W3C guidance. Confidence about 85%.

F9. WCAG 3.3.8 (Accessible Authentication) is satisfied by an email link or a code the user can paste, because no memory test or transcription is required; COGA objective 6 prefers simple single-step login. The app's magic link fits. Sources: F6 and F8. Evidence: standard and guidance. Confidence about 70% (my reading, not an explicit statement).

F10. GOV.UK Design System has patterns for question pages, error recovery, confirmation pages and check answers; the fetched page lists titles only, so details were not verified. Source: https://design-system.service.gov.uk/patterns/. Evidence: official design system (titles only). Confidence about 50% for any specific claim.

F11. Automated axe checks in Playwright catch contrast, missing labels and duplicate IDs, but cannot detect all WCAG violations; combine with manual and user testing. Source: https://playwright.dev/docs/accessibility-testing. Evidence: official documentation. Confidence about 90%.

### Performance

F12. Core Web Vitals good thresholds at the 75th percentile: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less. Source: https://web.dev/articles/vitals. Evidence: official documentation. Confidence about 90%.

F13. Fonts: `font-display: optional` avoids layout shift; `swap` shifts when the font arrives. CJK fonts have more than 10,000 characters and are much larger than Latin fonts; subsetting and `unicode-range` reduce download. Self-hosting removes a third-party connection but needs subsetting and WOFF2 by the developer. Source: https://web.dev/articles/font-best-practices. Evidence: official documentation. Confidence about 85%.

### Security

F14. With RLS enabled and no policy, the API returns no data to the publishable (anon) key. Recommended practice: revoke default grants to `anon` and `authenticated` and grant only what is needed; one policy per operation; name the role with `to`; wrap `auth.uid()` as `(select auth.uid())` for speed; index policy columns; never use the secret (service role) key in a browser. Source: https://supabase.com/docs/guides/database/postgres/row-level-security. Evidence: official documentation. Confidence about 85%.

F15. Magic links and email OTP expire after 1 hour by default and can be requested once per 60 seconds per user. Putting `{{ .Token }}` in the email template sends a 6-digit code that the user enters and `verifyOtp` checks. Source: https://supabase.com/docs/guides/auth/auth-email-passwordless. Evidence: official documentation. Confidence about 90%. (Email-scanner prefetch consuming links is not covered on that page; I did not verify it, confidence about 50% that it can occur.)

F16. A CSP can be set with a `<meta http-equiv>` tag on a static host, using hashes (not nonces). A meta CSP cannot use `frame-ancestors` or report-only; those need HTTP headers, which GitHub Pages does not let you set. Recommended: `object-src 'none'`, `base-uri 'none'`, avoid `unsafe-inline` and `unsafe-eval` for scripts. Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP. Evidence: official documentation. Confidence about 85%. (The statement that `frame-ancestors` is ignored in meta is from the tool's general knowledge, about 80%.)

F17. Subresource Integrity (`integrity` plus `crossorigin="anonymous"`) makes the browser reject a CDN file whose hash differs, defending against a compromised CDN. Source: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity. Evidence: official documentation. Confidence about 90%.

F18. GitHub Actions hardening: pin actions to a full commit SHA, set read-only default token permissions and grant more per job, do not interpolate untrusted input into scripts, use environment protection for secrets, use Dependabot for actions (alerts do not cover SHA-pinned actions, but version updates do). Source: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions. Evidence: official documentation. Confidence about 90%.

### Web Speech API

F19. `speechSynthesis.getVoices()` is Baseline widely available, but the list can be empty on first call and filled later (`voiceschanged`). Source: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices. Evidence: official documentation. Confidence about 80%.

F20. On iOS there are repeated reports that ja-JP or zh voices disappear from `getVoices()` after iOS updates (WebKit bug report 250665; Apple forum threads on iOS 18 missing voices and Mandarin spoken as Cantonese depending on the Spoken Content setting), and speech must start from a user gesture. Sources: https://bugs.webkit.org/show_bug.cgi?id=250665, https://developer.apple.com/forums/thread/764438, https://developer.apple.com/forums/thread/772348. Evidence: bug reports and forum posts (user reports, not documentation). Confidence about 65%.

F21. `SpeechRecognition` is not Baseline; in Chrome the audio is sent to a server and does not work offline. Source: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition. Evidence: official documentation. Confidence about 85%.

### Privacy (UK GDPR)

F22. UK GDPR gives a right to erasure (response within one month, no fee normally), and principles of data minimisation, storage limitation and security apply. The ICO says its erasure guidance is under review because of the Data (Use and Access) Act. Sources: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/ and https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/. Evidence: regulator guidance. Confidence about 85%. Whether the app is exempt as personal or household use was not answered by those pages; I did not verify it. This is not legal advice.

### Testing

F23. Playwright's WebKit is built from WebKit main and is not Safari; the documentation recommends macOS for the closest match. Source: https://playwright.dev/docs/browsers. Evidence: official documentation. Confidence about 90%.

F24. `toHaveScreenshot` baselines are specific to browser and operating system; run in the same environment where baselines were made. Source: https://playwright.dev/docs/test-snapshots. Evidence: official documentation. Confidence about 90%.

### Data sync

F25. No official source was found in this research for last-write-wins versus field-level merge; the following comes from reading `js/sync.js`, not from outside evidence. Confidence about 70% for the code reading.

## 3. What the app does today (files)

1. Service worker (`sw.js`): precaches 19 files including `content/content.js` (3.2 MB). Install calls `skipWaiting()`; activate calls `clients.claim()` and deletes other caches. Fetch for same-origin and CDN/fonts is "cache first, refresh in background" (stale-while-revalidate with cache priority). Supabase and YouTube are never cached. CACHE is set to the commit ID by `deploy.yml`.
2. Registration: `js/ui.js` line 255, only on HTTPS, errors ignored. No update notice and no `controllerchange` handling.
3. Manifest (`manifest.json`): name, short_name, start_url, scope, standalone, colours, 192 and 512 icons; the 512 icon is listed twice (any and maskable, same file). No `id`, no `screenshots`, no `lang`.
4. Content loading (`js/loader.js`): signed-in users get content from Supabase; the whole content is saved as JSON in `localStorage["ls-content-cache"]` inside a try/catch. In database mode `content/content.js` is still downloaded to the service worker cache but not used.
5. Storage: no `navigator.storage.persist()` call, no storage estimate.
6. Security: Supabase JS loaded from jsDelivr, version pinned to 2.39.3, no `integrity` attribute. No CSP. Inline user text is passed through `esc()`; user video titles are escaped when rendered (checked in `js/listen.js`). Video ids are validated by a regular expression (`ytId`). YouTube IFrame API script loaded from youtube.com.
7. Database (`supabase.sql`): RLS on all four tables; progress policies are `for all to authenticated using (auth.uid() = user_id) with check (...)`; content is readable by authenticated users. Policies use `auth.uid()` without `(select ...)`. No explicit `revoke` of default grants. No extra index on `user_id` apart from the primary keys, which start with `user_id` (acceptable).
8. Auth: email magic link (`signInWithOtp`), redirect to the same page. No 6-digit code option. Session read with `getSession`.
9. CI: `test.yml` has no `permissions` block (uses the repository default). `deploy.yml` sets `contents: read` and elevates only the deploy job. Actions are referenced by tag (`@v4`, `@v1`, `@v5`, `@v3`), not by commit ID. `claude.yml` has `contents: write` for the Claude job. No `dependabot.yml`. Secrets are used only in the deploy job.
10. Accessibility: `lang` set on the document and on content (`lang="ja"`, `zh-Hans`); `:focus-visible` outlines (3 px); `prefers-reduced-motion` rule (`index.html` line 426); `role="status"` on feedback; `aria-live` in the player; `role="tablist"` buttons in section and segment controls; `aria-current` on the bottom tab bar; labels on inputs; no zoom lock in the viewport meta; light and dark tokens.
11. Speech (`js/core.js`, `js/lessons.js`): `voicesFor()` filters by language; `voiceschanged` handled; if no `speechSynthesis` a note "This browser cannot play speech audio." is shown. If the API exists but no voice for the language, the utterance is still spoken with the default voice (language tag only) and no message is shown. Speech input: `SpeechRecognition`, then recording, then self-check as fallbacks (`speakMode`).
12. Tests: jsdom flows, sync test with a simulated database, Playwright Chromium on iPhone 15 Pro and Pixel 9 Pro profiles (`PW_WEBKIT=1` optional), layout, touch targets, one-primary-button checks. No axe. No screenshot comparison. WebKit is not in the CI run.
13. Sync (`js/sync.js`): per-word newer-timestamp-wins, activity as a union, settings and per-language details (placed, gi, mis, real, resume, etc.) as one whole-object last-write-wins record using `updatedAt`. Offline errors keep changes on the device and retry on `online`.
14. Privacy: no in-app way to export or delete account data was found in `js/` (searched for export, delete, account). No privacy text was checked in Settings beyond that search.

## 4. Gaps

1. No persistent-storage request; the offline copy relies on best-effort storage (F3, F4). Home Screen install reduces the 7-day risk on iOS, but a user who uses Safari in a browser tab is exposed.
2. Content is stored twice (service worker cache 3.2 MB, plus localStorage JSON). 5 MiB localStorage limit (F4): if the content JSON exceeds it, `setItem` fails silently and each start downloads all content rows again. I did not measure the JSON size; I measured only `content/content.js` at 3,207,092 bytes, which is a different representation. Confidence that this is a real risk: about 50% until measured.
3. `skipWaiting` with `clients.claim` and a precache of 19 files can mix versions in an open session (F1). The app's own JS files are loaded one by one by `loader.js`, so a mid-session update could mix old and new files.
4. No update notice: users learn of a new version only on a later start.
5. No CSP and no SRI on the Supabase script (F16, F17). A compromised CDN file would run with access to the signed-in session token in localStorage.
6. Actions pinned to tags, no Dependabot (F18).
7. No axe check, no WebKit run in CI, no visual regression (F11, F23, F24).
8. Speech: no message when the device lacks a voice for the language; iOS voice availability changes by version (F20).
9. Manifest lacks `id`; the maskable icon is the same file as the normal icon and may be cropped (F5; my reading, about 70%).
10. Policies use `auth.uid()` directly (F14); performance impact is negligible at one user and a few thousand rows; it is hygiene.
11. No account export or deletion path (F22).
12. Settings and per-language details are one last-write-wins object: two devices changing different fields offline (for example `mis` on one and `real` on the other) lose one side's changes. Probability is low for one user; impact is lost Mistakes or situation log entries.
13. The sign-in screen text uses an emoji (`🈶`) that `deEmoji()` removes (design rule 4 says not to rely on it). Outside this topic; noted only.

## 5. Ranked proposals

Rank 1. Persistent storage and storage health message.
- Problem: browser can delete the offline copy (gap 1, 2).
- Evidence: F3, F4 (official documentation).
- Change: call `navigator.storage.persist()` after sign-in (no prompt is shown in Safari or Chromium); also read `navigator.storage.estimate()`; in Settings, show one literal line, for example "Offline copy: saved on this device" or "may be removed by the browser". Add a message when the `localStorage` write of the content copy fails. Optionally move the content copy from localStorage to IndexedDB or the Cache API.
- Screen: Settings (line of text only).
- Effort: small (persist and message); medium (move to IndexedDB).
- Design rules touched: none (no new button).

Rank 2. Add Content-Security-Policy (meta tag) and SRI for the Supabase script.
- Problem: a compromised CDN script would run with the session token (gap 5).
- Evidence: F16, F17.
- Change: add `integrity` and `crossorigin="anonymous"` to the supabase-js script tag; add a meta CSP with `default-src 'self'`, `script-src 'self' https://cdn.jsdelivr.net https://www.youtube.com`, `object-src 'none'`, `base-uri 'none'`, `connect-src 'self' https://*.supabase.co`, `frame-src https://www.youtube.com`, `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src https://fonts.gstatic.com`, `img-src 'self' data: https://i.ytimg.com`. The app uses many inline `style=""` attributes, so `style-src` needs `'unsafe-inline'`. Meta cannot do `frame-ancestors` or report-only, so test with the Playwright phone tests and in a browser first. Self-hosting supabase-js in the repository would remove the CDN dependency and allow `script-src 'self'`.
- Screen: none.
- Effort: small (SRI); medium (CSP with testing; self-hosting adds the file to `CORE` and `deploy.yml` copy list).
- Design rules touched: none.

Rank 3. Safe update flow for the service worker.
- Problem: mixed versions and no update notice (gaps 3, 4).
- Evidence: F1, F2.
- Change: remove `skipWaiting()` from install; on `updatefound` with a waiting worker, show one literal line in Settings and on the Learn screen footer ("A new version is ready. Close and reopen the app to use it.") or a button "Update now" that posts `SKIP_WAITING` and reloads only when the user taps it. Keep the app from reloading by itself (design rule 8). Do not precache `content/content.js` when the app runs in database mode (saves 3.2 MB of download per release).
- Screen: Settings and Learn tab (text; button is optional and secondary).
- Effort: medium.
- Design rules touched: rule 2 (one primary action: use a link-style button) and rule 8 (no auto reload).

Rank 4. Harden GitHub Actions.
- Problem: actions referenced by tag; `test.yml` has no explicit permissions (gap 6).
- Evidence: F18.
- Change: pin each `uses:` to a commit ID with the version as a comment; add `permissions: contents: read` to `test.yml`; add `.github/dependabot.yml` for `github-actions` and `npm` (weekly). Workflow edits need the owner to name the files (CLAUDE.md sections 9 and 12).
- Screen: none.
- Effort: small.
- Design rules touched: none; needs the owner's explicit permission for `.github/workflows/*`.

Rank 5. Accessibility and browser-engine tests in CI.
- Problem: only layout, target and primary-button checks exist (gap 7).
- Evidence: F11, F23, F24.
- Change: add `@axe-core/playwright` to `tests/phone/phone.spec.js` for every registered screen in both languages (`withTags(["wcag2a","wcag2aa","wcag22aa"])`), with a baseline file for known violations like the existing touch baseline. Add a WebKit project to the CI run (Linux WebKit is acceptable; macOS is closer to Safari). Skip visual regression until baselines can be generated in the same CI image.
- Screen: all.
- Effort: medium.
- Design rules touched: none.

Rank 6. Speech voice check.
- Problem: iOS voices for ja/zh can be missing and the app speaks with no message (gap 8).
- Evidence: F19, F20 (user reports, about 65%).
- Change: in Settings, show "Voice for Japanese: found / not found" (and Chinese). When none is found, show one literal line on first audio tap: "This device has no Japanese voice. Install one in the phone settings (Accessibility, Spoken Content, Voices)." Longer term, evaluate pre-recorded audio for the 2,250 and 1,200 words (large storage and licensing cost; not recommended now).
- Screen: Settings; any audio button (one text line).
- Effort: small (message); large (recorded audio).
- Design rules touched: none.

Rank 7. Account data export and deletion route, plus a plain privacy text.
- Problem: UK GDPR rights (gap 11).
- Evidence: F22 (regulator guidance; not legal advice).
- Change: Settings row "Download my data" (JSON of `S`) and "Delete my account data" (needs a server function or manual owner action, since deleting `auth.users` needs the service key; a Supabase Edge Function is the usual route). Add a short literal privacy section: what is stored, where, that speech recognition in Chrome sends audio to a speech service.
- Screen: Settings.
- Effort: medium (export); large (deletion function).
- Design rules touched: rule 2 (secondary buttons only).

Rank 8. Supabase hygiene.
- Change: in `supabase.sql`, use `(select auth.uid())`, name `to authenticated` (already done), split `for all` into four policies, and `revoke all on ... from anon`. Add the 6-digit code option in the email template as a fallback for email clients that open links in another browser (confidence about 50% that this is a real problem for this user).
- Screen: sign-in (optional second input).
- Effort: small (SQL); medium (code entry).
- Design rules touched: none. Owner must run the SQL.

Rank 9. Field-level merge for per-language details.
- Change: store `mis`, `real`, `casualDone`, `resume` with their own timestamps inside `user_settings.data`, merge per key. Only worth doing if the owner uses two devices at once.
- Effort: medium. Rules touched: none.

Rank 10. Manifest and fonts.
- Change: add `id`, `lang`, a separate maskable icon with a safe zone, and `screenshots`; add `font-display` check (the Google Fonts URL already uses `display=swap`, which causes a layout shift when fonts arrive; `optional` or a system-font fallback with `size-adjust` avoids it); consider self-hosting subsets of Noto Sans JP and SC.
- Effort: small (manifest); medium (fonts).
- Rules touched: none.

## 6. Open questions for the owner

1. Which matters more for iOS: using the app inside Safari tabs, or always from the Home Screen icon? (Decides how urgent Rank 1 is.)
2. May Claude edit `.github/workflows/*` and add `.github/dependabot.yml` for Rank 4? (Section 9 requires you to name the files.)
3. Do you accept a small text line "A new version is ready" on the Learn tab (Rank 3)? Is a secondary "Update now" button acceptable, given no auto reload?
4. Is the app used only by you? If other people will sign in, a privacy notice and a deletion route (Rank 7) become more important; I cannot answer the legal question.
5. Should I measure the real size of the `ls-content-cache` JSON on a device before deciding on IndexedDB (gap 2)?

## 7. Sources list

1. https://web.dev/articles/service-worker-lifecycle
2. https://developer.chrome.com/docs/workbox/caching-strategies-overview
3. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
4. https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
5. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
6. https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
7. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
8. https://www.w3.org/TR/coga-usable/
9. https://design-system.service.gov.uk/patterns/
10. https://playwright.dev/docs/accessibility-testing
11. https://web.dev/articles/vitals
12. https://web.dev/articles/font-best-practices
13. https://supabase.com/docs/guides/database/postgres/row-level-security
14. https://supabase.com/docs/guides/auth/auth-email-passwordless
15. https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
16. https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
17. https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
18. https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
19. https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
20. https://bugs.webkit.org/show_bug.cgi?id=250665 and Apple forum threads 764438, 772348
21. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/
22. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/
23. https://playwright.dev/docs/browsers
24. https://playwright.dev/docs/test-snapshots
