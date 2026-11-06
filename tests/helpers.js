/* Test helpers: a simulated browser (jsdom) and a simulated Supabase database. */
const fs = require("fs"), path = require("path");
const jsdom = require("jsdom"), { JSDOM, VirtualConsole } = jsdom;
const root = path.join(__dirname, "..");
class FileLoader extends jsdom.ResourceLoader {
  fetch(url, opts) {
    if (url.startsWith("https://app.test/")) { const p = path.join(root, url.slice("https://app.test/".length).split("?")[0]); const pr = Promise.resolve(fs.readFileSync(p)); pr.abort = () => {}; return pr; }
    return null;
  }
}
function mockDB(store, user) {
  store.tables = store.tables || { content: [], word_progress: [], activity: [], user_settings: [] };
  const pk = { content: ["key"], word_progress: ["user_id", "lang", "word"], activity: ["user_id", "lang", "kind", "key"], user_settings: ["user_id"] };
  const T = store.tables;
  function builder(t) {
    const f = []; let mode = "select", single = false, rng = null, order = null;
    const run = () => {
      let rows = T[t].filter(r => f.every(([k, v]) => r[k] === v));
      if (mode === "delete") { T[t] = T[t].filter(r => !rows.includes(r)); return { data: null, error: null }; }
      if (order) rows = rows.slice().sort((a, b) => String(a[order]).localeCompare(String(b[order])));
      if (rng) rows = rows.slice(rng[0], rng[1] + 1);
      rows = JSON.parse(JSON.stringify(rows));
      return { data: single ? (rows[0] || null) : rows, error: null };
    };
    const b = {
      select() { return b; }, eq(k, v) { f.push([k, v]); return b; }, order(k) { order = k; return b; }, range(a, z) { rng = [a, z]; return b; },
      maybeSingle() { single = true; return b; }, delete() { mode = "delete"; return b; },
      upsert(rows) { (Array.isArray(rows) ? rows : [rows]).forEach(r => { const i = T[t].findIndex(x => pk[t].every(k => x[k] === r[k])); if (i >= 0) T[t][i] = { ...T[t][i], ...r }; else T[t].push({ ...r }); }); return Promise.resolve({ error: null }); },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); }
    };
    return b;
  }
  return {
    from: builder,
    auth: { getSession: async () => ({ data: { session: user ? { user } : null } }), signInWithOtp: async () => ({ error: null }), signOut: async () => ({ error: null }) }
  };
}
function makeDom({ db, failures }) {
  let html = fs.readFileSync(path.join(root, "index.html"), "utf8")
    .replace(/<script src="config\.js"><\/script>/, "<script>window.LS_CONFIG=" + JSON.stringify(db ? { supabaseUrl: "https://db.test", supabaseAnonKey: "anon" } : {}) + ";</script>")
    .replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*"><\/script>/, "");
  const vc = new VirtualConsole(); vc.on("jsdomError", e => { failures.push("page error: " + e.message); });
  const dom = new JSDOM(html, { url: "https://app.test/index.html", runScripts: "dangerously", resources: new FileLoader(), virtualConsole: vc, beforeParse(w) {
    w.scrollTo = () => {}; w.SpeechSynthesisUtterance = function (t) { this.text = t; };
    w.speechSynthesis = { speak(u) { setTimeout(() => u.onend && u.onend(), 1); }, cancel() {}, getVoices() { return []; } };
    if (db) w.supabase = { createClient: () => db };
  } });
  return dom;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
async function ready(dom) { for (let i = 0; i < 200; i++) { if (dom.window.eval("typeof render==='function'")) return; await wait(20); } throw new Error("app did not start: " + dom.window.document.getElementById("main").textContent.slice(0, 200)); }
function tools(dom, failures) {
  const d = dom.window.document, W = dom.window, M = () => d.getElementById("main").textContent;
  const click = t => { const b = [...d.querySelectorAll("button")].find(b => b.textContent.trim().includes(t) && !b.disabled); if (!b) throw new Error("button not found: " + t + " | " + M().slice(0, 150)); b.click(); };
  W.eval(`window.solve=function(q){
    if(q.type==="match"){q.pairs.forEach((p,i)=>{matchTap(q,"L",i);matchTap(q,"R",i);});return;}
    if(q.type==="build"){q.placed=[];const used=new Set();q.answer.forEach(a=>{const t=q.tiles.find(t=>!used.has(t.id)&&normW(t.text)===normW(a));used.add(t.id);q.placed.push(t.id);});render();return;}
    if(q.type==="type"){q.input=q.word.r;render();return;}
    if(q.type==="speak"){q.answered=true;q.correct=true;q.self=true;onAnswer(q);render();return;}
    q.sel=q.ans;render();}`);
  async function answerUntil(cond) { for (let k = 0; k < 80 && !cond(); k++) { W.eval("solve(view.q)"); if (!W.eval("view.q.answered")) click("Check answer"); if (!W.eval("view.q.correct")) failures.push("solved answer marked wrong: " + W.eval("view.q.type")); click("Continue"); } }
  async function doLesson() {
    for (let k = 0; k < 60 && W.eval("view.step") < 4; k++) { if (W.eval("view.step===1&&view.i>0")) { W.eval("solve(view.q)"); click("Check answer"); click("Continue"); } else click("Continue"); }
    await answerUntil(() => W.eval("view.step===5")); click("Go to home");
  }
  const startNext = () => { const b = d.querySelector(".card.hero .btn.pri"); if (!b) throw new Error("no next-step button | " + M().slice(0, 150)); b.click(); };
  const tab = t => { const b = [...d.querySelectorAll(".tabb")].find(b => b.textContent.includes(t)); if (!b) throw new Error("tab not found: " + t); b.click(); };
  /* Picks a language in the top-bar drop-down: lang("ja") or lang("zh"). */
  const lang = l => { const b = d.querySelector('#hd button[aria-label^="Language"]'); if (!b) throw new Error("language button not found"); b.click(); click(l === "ja" ? "Japanese" : "Chinese"); };
  return { d, W, M, click, answerUntil, doLesson, startNext, tab, lang };
}
module.exports = { mockDB, makeDom, wait, ready, tools, root };
