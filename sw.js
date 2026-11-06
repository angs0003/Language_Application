/* Offline support. Increase CACHE (for example to "ls-v3") every time you change
   index.html, js/*.js or content/content.js, so phones download the new version. */
const CACHE = "ls-v8";
const CORE = ["./", "./index.html", "./js/core.js", "./js/exercises.js", "./js/lessons.js", "./js/sections.js", "./js/exercise-types.js", "./js/path.js", "./js/listen.js", "./js/kanji.js", "./js/sync.js", "./js/ui.js", "./js/loader.js", "./js/content-rows.js", "./content/content.js",
  "./config.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (/supabase\.co$/.test(u.hostname) || /youtube/.test(u.hostname)) return; // database and video: always online
  const cacheable = u.origin === location.origin || /jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname);
  if (!cacheable) return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
