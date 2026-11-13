---
description: Take screenshots of any screen at the two phone sizes and look at them
argument-hint: <JavaScript that opens the screen> [--lang zh] [--dark]
---
Run `npm run shot -- --js "<code>" --name <short-name> [--lang zh] [--dark] [--after "<code>"] [--full]`.
The code runs in the page after the app started, so any app function works, for example:
- `openPod(0)`, `openChapter(0)`, `openTheme(0)`, `setTab('practise')`
- a lesson step: `{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=4;view.i=0;render();}`
- a question: build it with `mkBuild(...)` or `mkBlank(...)` and set `view={s:'review',qs:[q],i:0,finished:false}`; render()
- `--after "document.querySelector('summary').click()"` takes a second picture after an action (opening Options, a callout, a panel).
The PNG files are in `tmp/shots/` (not committed). Open each file with the Read tool and check, at 360 x 740 and at 412 x 915:
1. nothing is cut off, no text overlaps, no sideways scrolling;
2. one primary button, touch targets of at least 44 px, readable text (17 px body);
3. the screen works in both languages (`--lang zh` and `--lang ja`) and in dark mode (`--dark`) when colours changed.
Report what you saw in plain words, and fix problems before opening a pull request. For a feature that appears on many screens, take a picture of each screen (the list is in `tests/phone/screens.js`).
