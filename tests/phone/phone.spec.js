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
  test(`${lang} first lesson screen`, async ({ page }) => {
    const errors = await openApp(page, lang);
    await page.locator(".tabb", { hasText: "Learn" }).click();
    const start = page.locator(".card.hero .btn.pri").first();
    await expect(start).toBeVisible();
    await start.click();
    await expect(page.locator("#main")).not.toBeEmpty();
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
