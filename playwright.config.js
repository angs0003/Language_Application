/* Phone tests in a real browser engine (Chromium) at two phone screen sizes. Run: npm run test:phone
   First time on your computer: npx playwright install chromium */
const { defineConfig } = require("@playwright/test");
const launchOptions = process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {};
const phone = (width, height) => ({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, launchOptions });
module.exports = defineConfig({
  testDir: "tests/phone",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", browserName: "chromium" },
  projects: [
    { name: "small phone 360x740", use: phone(360, 740) },
    { name: "large phone 412x915", use: phone(412, 915) }
  ],
  webServer: { command: "node tests/phone/serve.js 4173", url: "http://localhost:4173", reuseExistingServer: true }
});
