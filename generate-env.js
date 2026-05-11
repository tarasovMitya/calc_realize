const fs = require("fs");
const url = process.env.VITE_SUPABASE_URL || "";
const key = process.env.VITE_SUPABASE_ANON_KEY || "";
fs.writeFileSync(
  "/app/dist/env-config.js",
  `window.__env__ = { VITE_SUPABASE_URL: '${url}', VITE_SUPABASE_ANON_KEY: '${key}' };\n`
);
console.log("env-config.js written, VITE_SUPABASE_URL =", url);
