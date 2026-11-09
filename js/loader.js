/* Starts the app: signs the user in, gets the content (from the database or the
   copy saved on this device), then loads the app files (APP_FILES) in order. */
(function () {
  const CFG = window.LS_CONFIG || {};
  const CACHE_KEY = "ls-content-cache";
  const main = () => document.getElementById("main");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load " + src)); document.body.appendChild(s); }); }
  const APP_FILES = ["js/core.js", "js/exercises.js", "js/lessons.js", "js/sections.js", "js/exercise-types.js", "js/path.js", "js/listen.js", "js/kanji.js", "js/sync.js", "js/ui.js"];
  async function loadApp() { for (const f of APP_FILES) await loadScript(f); }
  function apply(G) { for (const k of ["ZH", "JA", "GR", "STORY_ZH", "STORY_JA", "STORY", "TRIP_ZH", "TRIP_JA", "PARTS", "LEVELS", "VIDS", "KANJI_JA", "KANA", "TVREC", "CASUAL"]) window[k] = G[k]; window.LS_CONTENT_VERSION = G.version; }
  function screen(html) { const m = main(); if (m) m.innerHTML = html; const b = document.getElementById("bbar"); if (b) b.innerHTML = ""; }
  function signIn(db, msg) {
    screen(`<div class="card tint"><h2>🈶 Language Steps</h2><p>Sign in to start. Your progress is saved to your account, so it is the same on every device.</p>
      <label class="small muted" for="lsem">Email</label><input id="lsem" type="text" inputmode="email" autocomplete="email" placeholder="Your email address">
      ${msg ? `<p class="small"><strong>${esc(msg)}</strong></p>` : ""}<button id="lsgo" class="btn pri full" style="margin-top:8px">Send sign-in link</button>
      <p class="small muted" style="margin:10px 0 0">You receive an email with a link. Open it on this device and tap the link. You stay signed in on this device.</p></div>`);
    document.getElementById("lsgo").onclick = async () => {
      const email = document.getElementById("lsem").value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return signIn(db, "This is not a valid email address.");
      const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
      signIn(db, error ? "Could not send the link: " + error.message : "A sign-in link was sent to " + email + ". Open the email on this device and tap the link.");
    };
  }
  async function fetchAllContent(db) {
    const out = []; let from = 0;
    for (;;) {
      const { data, error } = await db.from("content").select("key,lang,kind,ord,data").order("key").range(from, from + 999);
      if (error) throw error; out.push(...data); if (data.length < 1000) break; from += 1000;
    }
    return out;
  }
  async function start() {
    const hasDB = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
    if (!hasDB) { await loadScript("content/content.js"); window.LS_DB = null; window.LS_CONTENT_SOURCE = "bundled"; return loadApp(); }
    const db = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
    window.LS_DB = db;
    const { data } = await db.auth.getSession();
    if (!data || !data.session) return signIn(db, "");
    let cached = null; try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (e) {}
    let G = cached;
    try {
      screen(`<div class="card"><p style="margin:0">Loading the learning content.</p></div>`);
      const { data: meta, error } = await db.from("content").select("data").eq("key", "meta:version").maybeSingle();
      if (error) throw error;
      const version = meta && meta.data && meta.data.version;
      if (!version) throw new Error("The database has no content yet. Run tools/upload-content.js (README step 3).");
      if (!cached || cached.version !== version) {
        G = LSContentRows.buildContent(await fetchAllContent(db));
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(G)); } catch (e) {}
      }
    } catch (e) {
      if (!cached) return screen(`<div class="card"><h2>Content could not be loaded</h2><p>${esc(e.message || e)}</p><p class="small muted">Check the internet connection, then reload the page.</p></div>`);
    }
    apply(G); window.LS_CONTENT_SOURCE = "database";
    return loadApp();
  }
  start().catch(e => screen(`<div class="card"><h2>The app could not start</h2><p>${esc(e.message || e)}</p></div>`));
})();
