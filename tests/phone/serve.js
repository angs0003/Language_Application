/* Minimal static file server for the phone tests (no dependencies). Usage: node tests/phone/serve.js [port] */
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), PORT = +process.argv[2] || 4173;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const f = path.join(ROOT, p === "/" ? "index.html" : p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log("Serving on http://localhost:" + PORT));
