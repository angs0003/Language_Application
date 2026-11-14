/* Converts built-in content to database rows and back.
   Used by the browser loader (js/loader.js) and by tools/upload-content.js. */
(function (root) {
  const LANGS = ["zh", "ja"];
  const TH = { zh: "ZH", ja: "JA" }, ST = { zh: "STORY_ZH", ja: "STORY_JA" }, TR = { zh: "TRIP_ZH", ja: "TRIP_JA" };
  function partOf(parts, i, key) { let p = parts[0]; parts.forEach(x => { if (i >= x[key]) p = x; }); return p; }
  function buildRows(G, version) {
    const rows = [];
    const add = (key, lang, kind, ord, data, level, part) => rows.push({ key, lang, kind, ord, level: level || null, part: part == null ? null : part, data });
    for (const l of LANGS) {
      const parts = G.PARTS[l];
      G[TH[l]].forEach((t, i) => { const p = partOf(parts, i, "t"); add(`${l}:theme:${i}`, l, "theme", i, t, p.lv, parts.indexOf(p)); });
      G[ST[l]].forEach((c, i) => { const p = partOf(parts, i, "t"); const { _p, ...clean } = c; add(`${l}:chapter:${i}`, l, "chapter", i, clean, p.lv, parts.indexOf(p)); });
      G.GR[l].forEach((g, i) => { const p = partOf(parts, i, "g"); add(`${l}:grammar:${i}`, l, "grammar", i, g, p.lv, parts.indexOf(p)); });
      G[TR[l]].forEach((d, i) => { const { _p, ...clean } = d; add(`${l}:trip:${i}`, l, "trip", i, clean); });
    }
    (G.KANJI_JA || []).forEach((k, i) => add(`ja:kanji:${i}`, "ja", "kanji", i, k));
    add("meta:kana", "ja", "meta", 4, G.KANA);
    add("meta:tv", "*", "meta", 5, G.TVREC);
    add("meta:parts", "*", "meta", 0, G.PARTS);
    add("meta:levels", "*", "meta", 1, G.LEVELS);
    add("meta:vids", "*", "meta", 2, G.VIDS);
    add("meta:casual", "*", "meta", 6, G.CASUAL || { ja: [], zh: [] });
    add("meta:accent", "ja", "meta", 7, G.ACCENT_JA || {});
    add("meta:version", "*", "meta", 3, { version: version || "local" });
    return rows;
  }
  function buildContent(rows) {
    const G = { KANJI_JA: [], KANA: null, TVREC: null, ZH: [], JA: [], GR: { zh: [], ja: [] }, STORY_ZH: [], STORY_JA: [], TRIP_ZH: [], TRIP_JA: [], PARTS: null, LEVELS: null, VIDS: null, CASUAL: null, ACCENT_JA: {}, version: null };
    const sorted = rows.slice().sort((a, b) => a.ord - b.ord);
    for (const r of sorted) {
      if (r.kind === "theme") G[TH[r.lang]].push(r.data);
      else if (r.kind === "chapter") G[ST[r.lang]].push(r.data);
      else if (r.kind === "grammar") G.GR[r.lang].push(r.data);
      else if (r.kind === "trip") G[TR[r.lang]].push(r.data);
      else if (r.kind === "kanji") G.KANJI_JA.push(r.data);
      else if (r.key === "meta:kana") G.KANA = r.data;
      else if (r.key === "meta:tv") G.TVREC = r.data;
      else if (r.key === "meta:parts") G.PARTS = r.data;
      else if (r.key === "meta:levels") G.LEVELS = r.data;
      else if (r.key === "meta:vids") G.VIDS = r.data;
      else if (r.key === "meta:casual") G.CASUAL = r.data;
      else if (r.key === "meta:accent") G.ACCENT_JA = r.data;
      else if (r.key === "meta:version") G.version = r.data.version;
    }
    G.STORY = { zh: G.STORY_ZH, ja: G.STORY_JA };
    return G;
  }
  /* Moras of a kana string (small ゃゅょ and small vowels join the kana before them; っ, ん and ー count as one mora each). Shared by the Sounds practice and the content check. */
  function moras(kana) {
    const small = "ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ", out = [];
    for (const ch of String(kana || "")) { if (small.includes(ch) && out.length) out[out.length - 1] += ch; else out.push(ch); }
    return out;
  }
  const api = { buildRows, buildContent, moras };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.LSContentRows = api;
})(typeof window !== "undefined" ? window : globalThis);
