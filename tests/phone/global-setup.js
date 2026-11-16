/* Fails loudly when the server on the test port serves another folder than this working copy (a stale server from another worktree). */
const { ROOT, URL } = require("./port.js");
module.exports = async () => {
  let got;
  try { const r = await fetch(URL + "/__root"); got = r.ok ? (await r.text()).trim() : "(no /__root: an old server without the identity check)"; }
  catch (e) { throw new Error("Phone tests: no server answers on " + URL + ": " + e.message); }
  if (got.toLowerCase() !== ROOT.toLowerCase())
    throw new Error(`Phone tests: the server on ${URL} serves "${got}" but this working copy is "${ROOT}". Stop that server, or set PHONE_PORT to a free port.`);
};
