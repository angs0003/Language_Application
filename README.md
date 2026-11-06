# Language Steps: Japanese and Chinese

A calm, predictable app for learning **Japanese** and **Mandarin Chinese (Simplified)**, designed to be
autism- and ADHD-friendly: one main action per screen, literal language, no timers and no streak pressure.

It is a website that installs on a phone like an app (a Progressive Web App), hosted free on GitHub Pages,
with a free Supabase database for sign-in, progress and learning content.

## Features

| Tab | What it contains |
|---|---|
| **Learn** | Language switch, level and progress, and a path of lessons, story chapters and reviews. Each lesson: new words, grammar, 6 practice sentences, story, quiz, summary. |
| **Practise** | One mixed practice session (due words, kanji and saved words), My words (search, filters, 4 practice modes), Kanji (stroke order step by step), Kana (hiragana and katakana), Grammar guide. |
| **Listen** | Story chapters and podcast episodes in a line-by-line player (loop, auto-pause, speed, text modes), YouTube videos inside the app (speed, section loop, synced subtitles where a transcript exists), and TV recommendations with ratings. |
| **Travel** | 8 situations per country (arrival, transport, eating, paying, hotel, small talk, problems, etiquette): what you will hear, what you say, tips, and practice. |

Other details:
- Spaced review for words, kanji, kana and saved words.
- Fading furigana: readings appear above kanji you have not learned yet.
- 10 exercise types, including match pairs, sentence building and fill-the-blank.
- Works offline after the first visit. Progress syncs between devices when you sign in with the same email.
- No AI and no running costs.

Current content: Japanese 450 words, 30 grammar points, 49 story chapters; Chinese 300 words, 20 grammar points,
34 story chapters; 6 practice sentences per theme; 16 travel situations; 373 kanji, 142 kana.

## Project structure

```
index.html            Page shell and all styles (design tokens and components)
config.js             Supabase URL and public (anon) key
sw.js                 Offline support (service worker)
manifest.json         Install-to-home-screen settings
icon-192.png, icon-512.png
js/
  loader.js           Sign-in, content download, then loads the app files in order
  content-rows.js     Converts content to database rows and back
  core.js ... ui.js   App code, split by area (see CLAUDE.md for the list and order)
content/
  content.js          Master copy of all learning content
tools/
  validate-content.js Checks the content structure
  upload-content.js   Uploads the content to the database
  load-content.js     Shared loader for the tools
tests/                Automated tests (simulated browser and database)
supabase.sql          Database tables and security rules
CLAUDE.md             Full context for Claude Code: design rules, architecture, how to add content
.env.example          Template for the private upload settings
```

---

## Setup (about 30 minutes, on a computer)

### Step 1: Create the database (Supabase)

1. Go to https://supabase.com and create a free account.
2. Tap **New project**. Name: `language-steps`. Create a database password and keep it safe.
   Choose the region nearest to you. Tap **Create new project** and wait until it is ready (about 2 minutes).
3. Open **SQL Editor** (left menu) > **New query**. Paste everything from `supabase.sql`. Tap **Run**.
   The result says "Success. No rows returned".
4. Open **Project Settings** > **API** (in some versions **API Keys**, tab **Legacy API keys**). Copy three values
   into a temporary note:
   - **Project URL** (ends with `.supabase.co`)
   - **anon public** key (public; goes into `config.js`)
   - **service_role** key (**private**; only for your computer, never put it in `config.js` or on GitHub)

### Step 2: Put the app online (GitHub Pages)

1. Open `config.js` in a text editor and paste the Project URL and the **anon** key between the quotes. Save.
2. Go to https://github.com and create a free account (or sign in).
3. Tap **+** (top right) > **New repository**. Name: `language-steps`. Choose **Public**. Tap **Create repository**.
4. Tap **uploading an existing file**. Drag in **all files and folders** from this package. Tap **Commit changes**.
   - Do **not** upload a `.env` file.
   - Files whose names start with a dot (`.gitignore`, `.env.example`) are hidden on most computers and may not
     upload. Check the file list on GitHub. If `.gitignore` is missing: tap **Add file** > **Create new file**,
     name it `.gitignore`, paste the contents of the `.gitignore` file from this package, and tap **Commit changes**.
5. Open **Settings** > **Pages**. Source **Deploy from a branch**, Branch **main**, folder **/ (root)**. Tap **Save**.
6. After 1 to 2 minutes, reload the Pages screen. It shows your address:
   `https://YOUR-USERNAME.github.io/language-steps/`
7. In Supabase, open **Authentication** > **URL Configuration**. Set **Site URL** to that address, and add the same
   address under **Redirect URLs**. Tap **Save**.

### Step 3: Upload the learning content to the database

1. Install Node.js (version 18 or newer) from https://nodejs.org.
2. In the package folder, copy `.env.example` to a new file named `.env`. Paste the Project URL and the
   **service_role** key. Save.
3. Open a terminal in the package folder and run:
   ```bash
   npm install
   npm test
   npm run upload
   ```
   `npm test` must end with "Smoke test OK.", "Sync test OK.", "Feature test OK." and "Kanji test OK.".
   The upload ends with "Uploaded ... rows".

### Step 4: Sign in and install on your phone

1. Open your app address on the phone. Enter your email and tap **Send sign-in link**.
2. Open the email **on the same phone** and tap the link. The app opens.
3. Install it:
   - **Android (Chrome):** **⋮** menu > **Install app** (or **Add to Home screen**).
   - **iPhone (Safari):** **Share** > **Add to Home Screen**.
4. Repeat steps 1 and 2 on every device you use. Your progress is the same on all of them.

Supabase's free plan limits how many sign-in emails it sends per hour. If no email arrives, wait and try again.

---

## Updating the app

### With Claude Code (recommended)

The repository includes a ready-made team setup: 8 commands, 8 subagents and 2 hooks. See `docs/claude-code-team.md`.

1. Download the repository: `git clone https://github.com/YOUR-USERNAME/language-steps.git`
2. Put your `.env` file into that folder. It is listed in `.gitignore`, so Git never uploads it.
3. Open a terminal in the folder, start Claude Code, and ask, for example:
   "Read CLAUDE.md, then add Japanese Level 2 Part 2."
4. Claude Code follows `CLAUDE.md`: it edits the files, runs `npm test`, commits to a branch and opens a
   pull request (`/release`). You merge the pull request on GitHub when the `test` check is green.
5. The Deploy workflow (`.github/workflows/deploy.yml`) then tests again, uploads new content, sets the cache
   version and publishes. One-time setup: `docs/claude-code-team.md`, section 8.

### What appears when

- **Content, code or design changes** (after you merge the pull request): 1 to 3 minutes later, at the next start of the app.

### Commands

| Command | What it does |
|---|---|
| `npm install` | Installs the test tools (once). |
| `npm test` | Checks the content, then runs all automated tests. |
| `npm run validate` | Checks the content only. |
| `npm run upload` | Uploads `content/content.js` to the database (needs `.env`). |

---

## Privacy and security

- Sign-in uses an email link; no passwords are stored by the app.
- Database security rules let each signed-in person read and write **only their own progress**.
- The **anon** key in `config.js` is designed to be public. The **service_role** key must stay in `.env` on your computer.

## Credits and licences

- Kanji stroke order: **KanjiVG**, by Ulrich Apel, licensed CC BY-SA 3.0.
- Kanji meanings and readings: **KANJIDIC2**, by the Electronic Dictionary Research and Development Group, licensed CC BY-SA 4.0.
- Fonts: Atkinson Hyperlegible, Noto Sans JP and Noto Sans SC (Google Fonts, SIL Open Font License).
- Learning content was written for this app without a native-speaker review. Report errors so they can be corrected.
