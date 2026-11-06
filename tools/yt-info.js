/* Prints title, channel, length, views, likes, upload date and caption status for YouTube video ids.
   Usage: node tools/yt-info.js ID1 ID2 ...   (needs YOUTUBE_API_KEY in .env) */
const fs = require("fs"), path = require("path");
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; });
const KEY = process.env.YOUTUBE_API_KEY, ids = process.argv.slice(2);
if (!KEY || !ids.length) { console.log("Usage: node tools/yt-info.js ID... (YOUTUBE_API_KEY must be in .env)"); process.exit(1); }
const dur = s => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s) || []; return `${(+m[1] || 0) * 60 + (+m[2] || 0)}:${String(+m[3] || 0).padStart(2, "0")}`; };
(async () => {
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids.join(",")}&key=${KEY}`);
  const d = await r.json(); if (d.error) { console.log("API error:", d.error.message); process.exit(1); }
  const found = new Set();
  for (const v of d.items) { found.add(v.id); const s = v.statistics, ratio = s.viewCount ? (100 * (+s.likeCount || 0) / +s.viewCount).toFixed(1) + "%" : "unknown";
    console.log(JSON.stringify({ id: v.id, title: v.snippet.title, channel: v.snippet.channelTitle, uploaded: v.snippet.publishedAt.slice(0, 10), length: dur(v.contentDetails.duration), views: +s.viewCount || 0, likes: +s.likeCount || 0, likeRatio: ratio, captions: v.contentDetails.caption === "true", language: v.snippet.defaultAudioLanguage || "unknown" })); }
  ids.filter(i => !found.has(i)).forEach(i => console.log(JSON.stringify({ id: i, error: "not found (removed, private or wrong id)" })));
})().catch(e => { console.log("Request failed:", e.message); process.exit(1); });