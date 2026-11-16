/* Runs the phone tests for some areas only. Usage: npm run test:phone:area -- <area[,area]> [text] [playwright options]
   Examples: npm run test:phone:area -- lessons      npm run test:phone:area -- tabs,lists --project="iPhone 15 Pro"
   An argument that starts with "-" and everything after it goes to Playwright. A plain second argument is part of a screen name (PHONE_SCREEN).
   Only the screens of the registry run (tests/phone/screens/*.js); the other phone tests are left out. Areas: see AREAS in tests/phone/screens.js. */
const { spawnSync } = require("child_process");
const args = process.argv.slice(2), env = Object.assign({}, process.env);
if (!args.length || args[0].startsWith("-")) { console.error("Usage: npm run test:phone:area -- <area[,area]> [screen name text] [playwright options]"); process.exit(2); }
env.PHONE_AREA = args.shift();
if (args.length && !args[0].startsWith("-")) env.PHONE_SCREEN = args.shift();
const r = spawnSync("npx", ["playwright", "test", "-g", '"(ja|zh) screen: |a11y (ja|zh) "', ...args.map(a => (/\s/.test(a) ? JSON.stringify(a) : a))], { stdio: "inherit", env, shell: true });
process.exit(r.status === null ? 1 : r.status);
