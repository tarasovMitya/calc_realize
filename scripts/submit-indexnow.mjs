// Submits all public URLs to IndexNow (Bing, Yandex, Seznam).
// Runs automatically on every build to notify search engines about new/updated pages.
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SITE = "https://slot-home.ru";
const KEY = "a9f3b2c8d1e4f7a6b5c3d2e9f1a8b7c4";
const ENDPOINT = "https://api.indexnow.org/indexnow";

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

const urlList = [
  `${SITE}/`,
  `${SITE}/blog`,
  `${SITE}/moscow`,
  `${SITE}/masters`,
  ...blogSlugs.map((s) => `${SITE}/blog/${s}`),
  ...districtSlugs.map((s) => `${SITE}/moscow/${s}`),
  ...SERVICE_SLUGS.map((s) => `${SITE}/masters/${s}`),
];

console.log(`📡 IndexNow: submitting ${urlList.length} URLs...`);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "slot-home.ru",
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});

// 200 = OK (already known), 202 = Accepted, 422 = key mismatch
if (res.status === 200 || res.status === 202) {
  console.log(`✅ IndexNow: accepted ${urlList.length} URLs (${res.status})`);
} else {
  const text = await res.text().catch(() => "");
  console.warn(`⚠️  IndexNow: ${res.status} ${text} — continuing build`);
}
