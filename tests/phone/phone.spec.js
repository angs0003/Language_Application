/* Phone tests: each tab screen in both languages, and the first lesson screen.
   Checks (CLAUDE.md section 3): no script errors, no sideways scrolling, at most one visible primary button,
   touch targets of at least 44 x 44 px. The app runs with bundled content (no database, no network).
   Touch targets that were already too small when this test was added are listed in touch-baseline.json:
   they are reported, not failed. Any new too-small target fails the test.
   After fixing old ones, refresh the list with: UPDATE_BASELINE=1 npm run test:phone */
const { test, expect } = require("@playwright/test");
const fs = require("fs"), path = require("path");
const BASE_FILE = path.join(__dirname, "touch-baseline.json");
const BASELINE = new Set(fs.existsSync(BASE_FILE) ? JSON.parse(fs.readFileSync(BASE_FILE, "utf8")) : []);
const found = new Set();

async function openApp(page, lang) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.route("**/config.js", r => r.fulfill({ contentType: "text/javascript", body: "window.LS_CONFIG={};" }));
  await page.route(/^https?:\/\/(?!localhost)/, r => r.abort()); // fonts, CDN, YouTube: offline for stable results
  await page.goto("/");
  await page.waitForFunction(() => document.querySelectorAll(".tabb").length === 4);
  if (lang) await page.evaluate(l => { if (S.lang !== l) setLang(l); }, lang);
  return errors;
}

async function checkScreen(page, name) {
  const r = await page.evaluate(() => {
    const vis = el => { const b = el.getBoundingClientRect(), s = getComputedStyle(el); return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const label = el => (el.getAttribute("aria-label") || el.textContent || el.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const small = [...document.querySelectorAll("button, a[href], input, select, summary, [role=button]")]
      .filter(vis)
      .filter(el => { const b = el.getBoundingClientRect(); return b.width < 43.5 || b.height < 43.5; })
      .map(el => { const b = el.getBoundingClientRect(); return { key: `${el.tagName.toLowerCase()}.${[...el.classList].sort().join(".")}`, label: label(el), w: Math.round(b.width), h: Math.round(b.height) }; });
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      primaries: [...document.querySelectorAll(".btn.pri")].filter(vis).length,
      small
    };
  });
  expect(r.overflow, `${name}: the page scrolls sideways by ${r.overflow} px`).toBeLessThanOrEqual(1);
  expect(r.primaries, `${name}: more than one visible primary button`).toBeLessThanOrEqual(1);
  const fresh = [];
  for (const s of r.small) {
    const id = `${name} | ${s.key} | ${s.label}`; found.add(id);
    if (!BASELINE.has(id)) fresh.push(`${id} (${s.w} x ${s.h} px)`);
  }
  const known = r.small.length - fresh.length;
  if (known) console.log(`${name}: ${known} known touch target(s) under 44 px (see touch-baseline.json)`);
  if (!process.env.UPDATE_BASELINE) expect(fresh, `${name}: new touch targets under 44 x 44 px`).toEqual([]);
}

for (const lang of ["ja", "zh"]) {
  for (const tab of ["Learn", "Practise", "Listen", "Travel"]) {
    test(`${lang} ${tab} tab`, async ({ page }) => {
      const errors = await openApp(page, lang);
      await page.locator(".tabb", { hasText: tab }).click();
      await expect(page.locator("h1")).toBeVisible();
      await checkScreen(page, `${lang} ${tab}`);
      expect(errors, "script errors").toEqual([]);
    });
  }
  test(`${lang} Travel: Phrases to review and You say`, async ({ page }) => {
    const errors = await openApp(page, lang);
    await page.evaluate(() => realSet(S.lang, sentText(trip(S.lang, 0)._p.say[0].p), "repeat"));
    await page.locator(".tabb", { hasText: "Travel" }).click();
    await page.locator(".lrow", { hasText: "Phrases to review" }).click();
    await expect(page.locator("#main")).toContainText("Used in real life");
    await page.locator(".realit .lrow").first().click();
    await expect(page.locator(".realit .btn.sec")).toHaveCount(3);
    await checkScreen(page, `${lang} Phrases to review`);
    await page.evaluate(() => { openTrip(0); view.tt = "say"; render(); });
    await page.locator(".realb .btn.link").first().click();
    // The word tokens (button.tk) on this screen were already below 44 px before this feature: only the new controls are measured.
    const sizes = await page.evaluate(() => [...document.querySelectorAll(".realb button")].map(b => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
    expect(sizes.length).toBeGreaterThanOrEqual(3);
    for (const [w, h] of sizes) { expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => [...document.querySelectorAll(".btn.pri")].length), "primary buttons").toBeLessThanOrEqual(1);
    expect(errors, "script errors").toEqual([]);
  });
  test(`${lang} Practise: Casual speech list, lesson and quiz`, async ({ page }) => {
    const errors = await openApp(page, lang);
    await page.evaluate(() => { CASUAL[S.lang].length = 0; CASUAL[S.lang].push({ t: "Fixture lesson", e: "Explanation.", p: [["私|watashi|I / 。 = I.", "俺|ore|I / 。 = I.", "a friend"], ["私|watashi|I / 。 = I.", "僕|boku|I / 。 = I.", "a friend"]] }); });
    await page.locator(".tabb", { hasText: "Practise" }).click();
    await page.locator(".lrow", { hasText: "Casual speech" }).click();
    await checkScreen(page, `${lang} Casual speech list`);
    await page.locator(".lrow", { hasText: "Fixture lesson" }).click();
    await expect(page.locator("#main")).toContainText("Casual (a friend)");
    // Word tokens (button.tk) are already below 44 px on other screens (see touch-baseline.json): only the new controls are measured.
    const sizes = await page.evaluate(() => [...document.querySelectorAll("#main button:not(.tk), #bbar button")].map(b => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
    expect(sizes.length).toBeGreaterThanOrEqual(5);
    for (const [w, h] of sizes) { expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.querySelectorAll(".btn.pri").length), "primary buttons").toBeLessThanOrEqual(1);
    await page.locator("#nextbtn").click();
    await expect(page.locator("#hd")).toContainText("Question 1 of 4");
    await checkScreen(page, `${lang} Casual speech quiz`);
    expect(errors, "script errors").toEqual([]);
  });
  // Word callout on every screen where words can be tapped (CLAUDE.md rule 10). Each screen is opened by an app function.
  const CALLOUT_SCREENS = {
    "lesson grammar": () => { const l = S.lang, t = themes(l)[0]; startLesson(t.words.slice(0, 5), t.title); view.step = 1; view.i = 0; render(); },
    "lesson sentences": () => { const l = S.lang, t = themes(l)[0]; startLesson(t.words.slice(0, 5), t.title); view.step = 2; view.i = 0; render(); },
    "lesson story": () => { const l = S.lang, t = themes(l)[0]; startLesson(t.words.slice(0, 5), t.title); view.step = 3; view.i = 0; render(); },
    "quiz feedback panel": () => { const l = S.lang, t = themes(l)[0]; startLesson(t.words.slice(0, 5), t.title); view.step = 4; const i = view.quiz.findIndex(q => ["build", "blank", "lbuild", "buildEn", "gram"].includes(q.type)); view.i = Math.max(i, 0); const q = view.quiz[view.i]; q.answered = true; q.correct = false; q.dk = false; render(); },
    "lesson new word example": () => { const l = S.lang, t = themes(l)[0]; startLesson(t.words.slice(0, 5), t.title); },
    "theme page": () => openTheme(0),
    "theme page word list": () => openTheme(0),
    "story reader": () => openChapter(0),
    "story player": () => openPlayer("story", 0),
    "podcast player": () => openPlayer("pod", 0),
    "travel conversation": () => openTrip(0)
  };
  for (const [name, open] of Object.entries(CALLOUT_SCREENS)) {
    test(`${lang} word callout: ${name}`, async ({ page }) => {
      const errors = await openApp(page, lang);
      await page.evaluate(l => { S[l].placed = true; }, lang);
      await page.evaluate("(" + open.toString() + ")()");
      const words = page.locator(name === "theme page word list" ? ".wordrow" : name === "lesson new word example" ? "#main .tk:not(.pu)" : ".tk:not(.pu)");
      expect(await words.count(), "tappable words on this screen").toBeGreaterThan(0);
      for (const pos of ["first", "last"]) {
        const w = words[pos]();
        await w.scrollIntoViewIfNeeded();
        await w.click();
        await expect(page.locator("#callout")).toBeVisible();
        const r = await page.evaluate(() => {
          const c = document.getElementById("callout"), b = c.getBoundingClientRect(), vw = innerWidth;
          const inPanel = !!document.querySelector(".tk.on, .wordrow.on").closest("#fbp");
          const bars = [...document.querySelectorAll(inPanel ? "#bbarw, #tabs" : "#bbarw, #tabs, #fbp")].filter(e => !e.hidden && e.getBoundingClientRect().height > 0).map(e => e.getBoundingClientRect().top);
          const mid = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2), onTop = !!mid && c.contains(mid);
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, vw, barTop: bars.length ? Math.min(...bars) : innerHeight, onTop, buttons: c.querySelectorAll("button").length, inPanel, position: getComputedStyle(c).position, overflow: document.documentElement.scrollWidth - vw };
        });
        expect(r.left, pos + ": left edge inside the screen").toBeGreaterThanOrEqual(0);
        expect(r.right, pos + ": right edge inside the screen").toBeLessThanOrEqual(r.vw);
        expect(r.top, pos + ": top inside the page").toBeGreaterThanOrEqual(0);
        expect(r.bottom, pos + ": not under the bottom bar").toBeLessThanOrEqual(r.barTop);
        expect(r.onTop, pos + ": the callout is not covered").toBe(true);
        expect(r.buttons, pos + ": the callout has no buttons").toBe(0);
        expect(r.overflow, pos + ": page scrolls sideways").toBeLessThanOrEqual(1);
        if (r.inPanel) expect(r.position, "a callout for a word in the fixed panel is fixed too").toBe("fixed");
        await page.keyboard.press("Escape");
        await expect(page.locator("#callout")).toHaveCount(0);
      }
      expect(errors, "script errors").toEqual([]);
    });
  }
  // System Back (Android back gesture or button) = the app's Back; on a tab screen it leaves the app. page.goBack() fires the same popstate.
  test(`${lang} system back`, async ({ page }) => {
    const errors = await openApp(page, lang);
    await page.evaluate(l => { S[l].placed = true; save(); render(); }, lang);
    const where = () => page.evaluate(() => view.s + (view.s === "lesson" ? ":" + view.step + ":" + view.i : ""));
    await page.evaluate(() => { const t = themes(S.lang)[0]; startLesson(t.words.slice(0, 5), t.title); });
    await page.locator("#nextbtn").click(); await page.locator("#nextbtn").click();
    expect(await where(), "third word").toBe("lesson:0:2");
    await page.goBack(); await expect.poll(where).toBe("lesson:0:1");
    await page.goBack(); await expect.poll(where).toBe("lesson:0:0");
    await page.goBack(); await expect.poll(where, "Back on the first word leaves the lesson").toBe("home");
    await expect(page.locator(".tabb[aria-current=page]")).toHaveText(/Learn/);
    // a word callout is closed first, then the screen goes back
    await page.evaluate(() => { openChapter(0); });
    await page.locator(".tk:not(.pu)").first().click(); await expect(page.locator("#callout")).toBeVisible();
    await page.goBack(); await expect(page.locator("#callout")).toHaveCount(0); expect(await where(), "still on the chapter").toBe("story");
    await page.goBack(); await expect.poll(where).toBe("home");
    // the Exit panel is closed first
    await page.evaluate(() => { const t = themes(S.lang)[0]; startLesson(t.words.slice(0, 5), t.title); });
    await page.locator("[aria-label=Exit]").click(); await expect(page.locator(".confirm")).toBeVisible();
    await page.goBack(); await expect(page.locator(".confirm")).toHaveCount(0); expect(await where()).toBe("lesson:0:0");
    await page.goBack(); await expect.poll(where).toBe("home");
    // using the app's own Back and Exit buttons does not pile up history entries
    const len0 = await page.evaluate(() => history.length);
    for (let n = 0; n < 4; n++) {
      await page.evaluate(() => { const t = themes(S.lang)[0]; startLesson(t.words.slice(0, 5), t.title); });
      await page.locator("#bbar button", { hasText: "Back" }).click(); await expect.poll(where).toBe("home");
    }
    expect(await page.evaluate(() => history.length), "history length after 4 lessons opened and left with Back").toBeLessThanOrEqual(len0 + 1);
    // a sub-screen (Settings) goes back to the tab, and Back on the tab screen leaves the app
    await page.locator("[aria-label='Profile and settings']").click(); await expect.poll(where).toBe("settings");
    await page.goBack(); await expect.poll(where).toBe("home");
    await page.goBack(); await expect.poll(() => page.url(), "Back on a tab screen leaves the app").toBe("about:blank");
    expect(errors, "script errors").toEqual([]);
  });
  test(`${lang} first lesson screen`, async ({ page }) => {
    const errors = await openApp(page, lang);
    await page.evaluate(l => { S[l].placed = true; save(); render(); }, lang);/* without a placement the first card opens the placement quiz, not a lesson */
    await page.locator(".tabb", { hasText: "Learn" }).click();
    const start = page.locator(".card.hero .btn.pri").first();
    await expect(start).toBeVisible();
    await start.click();
    await expect(page.locator("#main")).not.toBeEmpty();
    const star = page.locator(".starbtn");
    await expect(star, "star on the New word card").toBeVisible();
    const sb = await star.boundingBox(), card = await page.locator(".card.hasstar").boundingBox();
    expect(sb.width).toBeGreaterThanOrEqual(44); expect(sb.height).toBeGreaterThanOrEqual(44);
    expect(sb.x + sb.width, "star at the right edge of the card").toBeGreaterThan(card.x + card.width - 24); expect(sb.y, "star at the top of the card").toBeLessThan(card.y + 24);
    const back = page.locator("#bbar button", { hasText: "Back" });
    await expect(back, "Back is active on the first word").toBeEnabled();
    const bb = await back.boundingBox(); expect(bb.width).toBeGreaterThanOrEqual(44); expect(bb.height).toBeGreaterThanOrEqual(44);
    await checkScreen(page, `${lang} lesson`);
    expect(errors, "script errors").toEqual([]);
  });
}

test.afterAll(async ({}, info) => {
  if (process.env.UPDATE_BASELINE && info.project.name.startsWith("small")) {
    const all = new Set([...found]);
    fs.writeFileSync(BASE_FILE, JSON.stringify([...all].sort(), null, 2) + "\n");
    console.log(`Wrote ${all.size} entries to touch-baseline.json`);
  }
});
