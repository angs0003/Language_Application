/* Phone tests: the two phones the app is made for, using Playwright's own device profiles (screen size, pixel ratio, touch, user agent):
     iPhone 15 Pro  393 x 659 visible in Safari (393 x 852 screen)
     Pixel 9 Pro    427 x 876 visible in Chrome (427 x 952 screen)
   No other sizes are tested. Run: npm run test:phone. First time on your computer: npx playwright install chromium
   Both phones run in Chromium (always available, also in GitHub). To run the iPhone in its real engine, WebKit: npx playwright install webkit, then PW_WEBKIT=1 npm run test:phone
   (the Pixel project is skipped in that run; GitHub does not run WebKit yet). */
const { defineConfig, devices } = require("@playwright/test");
const launchOptions = process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {};
const webkit = process.env.PW_WEBKIT === "1";
const phone = (name, keepEngine) => { const { defaultBrowserType, ...d } = devices[name]; return Object.assign({}, d, keepEngine ? { browserName: defaultBrowserType } : { browserName: "chromium", launchOptions }); };
module.exports = defineConfig({
  testDir: "tests/phone",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173" },
  projects: webkit
    ? [{ name: "iPhone 15 Pro", use: phone("iPhone 15 Pro", true) }]
    : [{ name: "iPhone 15 Pro", use: phone("iPhone 15 Pro") }, { name: "Pixel 9 Pro", use: phone("Pixel 9 Pro") }],
  webServer: { command: "node tests/phone/serve.js 4173", url: "http://localhost:4173", reuseExistingServer: true }
});
