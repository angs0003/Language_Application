/* Port and directory of the phone-test server, one port per working copy (git worktree), so that a server left running by another
   working copy cannot serve old code. The port comes from a hash of the repository folder (range 4200 to 5199); PHONE_PORT overrides it. */
const path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..", "..");
const hash = crypto.createHash("sha1").update(ROOT.toLowerCase()).digest().readUInt16BE(0);
const PORT = +process.env.PHONE_PORT || 4200 + (hash % 1000);
module.exports = { ROOT, PORT, URL: "http://localhost:" + PORT };
