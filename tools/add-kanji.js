/* Adds every kanji that the Japanese words use but KANJI_JA does not have yet.
   Run: node tools/add-kanji.js          (writes the content part that holds KANJI_JA)
        node tools/add-kanji.js --dry    (only lists the missing kanji)
   Meanings and readings come from KANJIDIC2 (EDRDG, CC BY-SA 4.0) through https://kanjiapi.dev.
   Stroke paths come from KanjiVG (Ulrich Apel, CC BY-SA 3.0). New kanji are appended in order of first appearance.
   Format matches the existing entries: first 3 meanings with a capital letter, readings in hiragana,
   path numbers cut to 1 decimal place. */
// (fs and path are not needed: the content parts are read by tools/lib-content-files.js)
const { readContent, writeContent } = require("./lib-content-files");
const G = require("./load-content")();
const have = new Set(G.KANJI_JA.map(k => k.c)), missing = [];
G.JA.forEach(t => t[1].forEach(w => [...w[0]].forEach(c => { if (/[一-鿿]/.test(c) && !have.has(c) && !missing.includes(c)) missing.push(c); })));
console.log(missing.length ? `Missing kanji (${missing.length}): ${missing.join("")}` : "No missing kanji.");
if (!missing.length || process.argv.includes("--dry")) process.exit(0);
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const cut = n => { const m = String(n).match(/^(-?)(\d+)\.(\d)/); return m ? `${m[1]}${m[2]}.${m[3]}` : String(n); };
const cutPath = d => d.replace(/-?\d+\.\d+/g, cut);
async function get(url) { for (let i = 0; i < 3; i++) { try { const r = await fetch(url); if (r.ok) return r; if (r.status === 404) return null; } catch (e) { } await new Promise(r => setTimeout(r, 800)); } throw new Error("Could not download " + url); }
(async () => {
  const out = [];
  for (const c of missing) {
    const hex = c.codePointAt(0).toString(16).padStart(5, "0");
    const a = await get("https://kanjiapi.dev/v1/kanji/" + encodeURIComponent(c));
    const v = await get(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
    if (!a || !v) { console.log("FAILED:", c, "kanjiapi:", !!a, "KanjiVG:", !!v); process.exitCode = 1; continue; }
    const info = await a.json(), svg = await v.text();
    const paths = [...svg.matchAll(/<path id="kvg:[0-9a-f]+-s(\d+)"[^>]*? d="([^"]+)"/g)].sort((x, y) => x[1] - y[1]).map(m => cutPath(m[2]));
    if (paths.length !== info.stroke_count) console.log(`NOTE: ${c} has ${paths.length} KanjiVG strokes and stroke_count ${info.stroke_count}`);
    out.push({ c, m: info.meanings.slice(0, 3).map(x => x[0].toUpperCase() + x.slice(1)), on: info.on_readings.map(toHira), kun: info.kun_readings, n: paths.length, p: paths });
    process.stdout.write(c);
  }
  console.log();
  if (process.exitCode) { console.log("Some kanji failed. Nothing written."); return; }
  let s = readContent();
  const start = s.indexOf("const KANJI_JA="), next = s.indexOf("/*@part ", start), at = s.lastIndexOf("}];", next < 0 ? s.length : next);
  if (start < 0 || at < start) throw new Error("Could not find the end of KANJI_JA in the content parts");
  s = s.slice(0, at + 1) + "," + out.map(o => JSON.stringify(o)).join(",") + s.slice(at + 1);
  writeContent(s);
  console.log(`Added ${out.length} kanji to KANJI_JA.`);
})().catch(e => { console.log("ERROR:", e.message); process.exit(1); });
