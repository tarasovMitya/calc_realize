// Pre-renders public pages to static HTML so Google's crawler gets real content
// without needing its JS rendering queue. Runs as part of the build step.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { resolve, dirname, join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");
const PORT = 3779;

// ── Parse routes from source data ─────────────────────────────────────────
const blogSrc = readFileSync(resolve(root, "src/pages/blog/blogData.ts"), "utf-8");
const blogSlugs = [...blogSrc.matchAll(/slug:\s*"([^"]+)"/g)]
  .map((m) => m[1])
  .filter((s) => s !== "string");

const geoSrc = readFileSync(resolve(root, "src/pages/geo/districtData.ts"), "utf-8");
const districtSlugs = [...geoSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const SERVICE_SLUGS = [
  "electrician", "plumber", "cleaning", "handyman",
  "furniture-assembly", "dry-cleaning", "door-installation", "tv-installation",
];

const ROUTES = [
  "/",
  "/blog",
  "/moscow",
  "/masters",
  "/terms",
  "/privacy",
  "/contacts",
  ...blogSlugs.map((s) => `/blog/${s}`),
  ...districtSlugs.map((s) => `/moscow/${s}`),
  ...SERVICE_SLUGS.map((s) => `/masters/${s}`),
];

// ── Simple static file server for the built dist ───────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = req.url.split("?")[0];
      let filePath = join(dist, urlPath === "/" ? "index.html" : urlPath);
      try {
        const s = await stat(filePath);
        if (s.isDirectory()) filePath = join(filePath, "index.html");
      } catch {
        filePath = join(dist, "index.html");
      }
      try {
        const content = await readFile(filePath);
        res.setHeader("Content-Type", MIME[extname(filePath)] || "application/octet-stream");
        res.end(content);
      } catch {
        const fallback = await readFile(join(dist, "index.html"));
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fallback);
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

// ── Render ─────────────────────────────────────────────────────────────────
async function renderRoute(page, route) {
  await page.goto(`http://localhost:${PORT}${route}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  const html = await page.content();

  const parts = route === "/" ? [] : route.replace(/^\//, "").split("/").filter(Boolean);
  const filePath = resolve(dist, ...parts, "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, "utf-8");
}

// ── Main ───────────────────────────────────────────────────────────────────
const server = await startServer();
console.log(`🖥  Prerender server on :${PORT} (${ROUTES.length} routes)`);

const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
let browser;
try {
  browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {}),
  });
} catch (e) {
  console.warn(`⚠️  Chromium unavailable: ${e.message}\n   Skipping prerender.`);
  server.close();
  process.exit(0);
}

const CONCURRENCY = 4;
let success = 0;
let failed = 0;

async function worker(routes) {
  const page = await browser.newPage();
  for (const route of routes) {
    try {
      await renderRoute(page, route);
      process.stdout.write(`✅ ${route}\n`);
      success++;
    } catch (e) {
      process.stdout.write(`⚠️  ${route}: ${e.message}\n`);
      failed++;
    }
  }
  await page.close();
}

// Split routes across workers
const chunks = Array.from({ length: CONCURRENCY }, (_, i) =>
  ROUTES.filter((_, j) => j % CONCURRENCY === i)
);
await Promise.all(chunks.map(worker));

await browser.close();
server.close();

console.log(`\n✅ Prerender done: ${success} OK, ${failed} failed (${ROUTES.length} total)`);
if (failed > 0) console.log("   Failed pages will fall back to client-side rendering.");
