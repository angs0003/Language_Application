/* Screenshots of any screen of the app at phone sizes, to look at a change before a pull request (no temporary test files needed).
   Usage: npm run shot -- --js "openPod(0)" --name podcast [--lang zh] [--sizes 360x740,412x915] [--dark] [--full] [--after "code"]
     --js     JavaScript run in the page after the app has started and the language is set and marked as placed (any app function: openPod(0), startLesson(...), openTheme(0), ...)
     --after  more JavaScript run after the first screenshot; a second screenshot is saved as <name>-after-<size>.png (for example open a callout or Options)
     --lang   zh or ja (default ja)
     --dark   dark mode
   The PNG files are saved in tmp/shots/ (not committed) and their paths are printed. First time on a computer: npx playwright install chromium */
const http = require("http"), fs = require("fs"), path = require("path");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const has = k => process.argv.includes("--" + k);
if (!arg("js")) { console.log(fs.readFileSync(__filename, "utf8").split("*/")[0].replace(/^\/\* ?/, "")); process.exit(has("help") ? 0 : 1); }

const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "tmp", "shots"), TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname), f = path.join(ROOT, p === "/" ? "index.html" : p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});
(async () => {
  const { chromium } = require("@playwright/test");
  await new Promise(r => server.listen(0, r));
  const base = "http://localhost:" + server.address().port, lang = arg("lang", "ja"), name = (arg("name", "screen") || "screen").replace(/[^\w-]/g, "_");
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {}), files = [];
  try {
    for (const size of arg("sizes", "360x740,412x915").split(",")) {
      const [w, h] = size.split("x").map(Number);
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, colorScheme: has("dark") ? "dark" : "light" });
      const page = await ctx.newPage(), errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.route("**/config.js", r => r.fulfill({ contentType: "text/javascript", body: "window.LS_CONFIG={};" }));
      await page.route(/^https?:\/\/(?!localhost)/, r => r.abort());
      await page.goto(base + "/"); await page.waitForFunction(() => document.querySelectorAll(".tabb").length === 4);
      await page.evaluate(l => { if (S.lang !== l) setLang(l); S[l].placed = true; render(); }, lang);
      await page.evaluate(arg("js")); await page.waitForTimeout(300);
      let f = path.join(OUT, `${name}-${size}.png`); await page.screenshot({ path: f, fullPage: has("full") }); files.push(f);
      if (arg("after")) { await page.evaluate(arg("after")); await page.waitForTimeout(300); f = path.join(OUT, `${name}-after-${size}.png`); await page.screenshot({ path: f, fullPage: has("full") }); files.push(f); }
      if (errors.length) console.log(`script errors at ${size}: ` + errors.join("; "));
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  files.forEach(f => console.log(path.relative(process.cwd(), f)));
})().catch(e => { console.error("Error: " + e.message); server.close(); process.exit(1); });
