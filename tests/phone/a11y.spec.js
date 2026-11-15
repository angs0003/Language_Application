/* Accessibility check with axe (WCAG 2.2 level A and AA rules) on every registered screen (tests/phone/screens.js), in both languages, in light and dark mode.
   It runs on the iPhone project only (the result does not depend on the phone size).
   A violation that cannot be fixed at once is listed in a11y-baseline.json ("<language> <screen>|<mode>": [rule ids]): it is reported, not failed. A new violation fails the test.
   The file does not exist while there are none. Create or refresh it with: UPDATE_A11Y_BASELINE=1 npx playwright test a11y --workers=1 --project="iPhone 15 Pro" */
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs"), path = require("path");
const BASE_FILE = path.join(__dirname, "a11y-baseline.json");
const BASELINE = fs.existsSync(BASE_FILE) ? JSON.parse(fs.readFileSync(BASE_FILE, "utf8")) : {};
const found = {};
const UPDATE = process.env.UPDATE_A11Y_BASELINE === "1";

for (const lang of ["zh", "ja"]) {
  for (const sc of require("./screens.js").screens) {
    if (sc.langs && !sc.langs.includes(lang)) continue;
    test(`a11y ${lang} ${sc.name}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "iPhone 15 Pro", "runs once, on the iPhone project");
      await page.route("**/config.js", r => r.fulfill({ contentType: "text/javascript", body: "window.LS_CONFIG={};" }));
      await page.route(/^https?:\/\/(?!localhost)/, r => r.abort());
      await page.goto("/");
      await page.waitForFunction(() => document.querySelectorAll(".tabb").length === 4);
      await page.evaluate(l => { if (S.lang !== l) setLang(l); S[l].placed = true; save(); render(); }, lang);
      if (sc.setup) await page.evaluate(sc.setup);
      await page.evaluate(sc.open); await page.waitForTimeout(150);
      const report = [];
      for (const mode of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: mode });
        const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const key = `${lang} ${sc.name}|${mode}`, ids = [...new Set(res.violations.map(v => v.id))].sort();
        found[key] = ids;
        const fresh = ids.filter(id => !(BASELINE[key] || []).includes(id));
        res.violations.filter(v => fresh.includes(v.id)).forEach(v => report.push(`${key}: ${v.id} (${v.impact}): ${v.help}; e.g. ${v.nodes[0].target.join(" ")}`));
      }
      if (!UPDATE) expect(report, "new accessibility violations").toEqual([]);
    });
  }
}
test.afterAll(({}, testInfo) => {
  if (UPDATE && testInfo.project.name === "iPhone 15 Pro") {
    const out = {}; Object.keys(found).sort().forEach(k => { if (found[k].length) out[k] = found[k]; });
    if (Object.keys(out).length) fs.writeFileSync(BASE_FILE, JSON.stringify(out, null, 1) + "\n"); else if (fs.existsSync(BASE_FILE)) fs.unlinkSync(BASE_FILE);
  }
});
