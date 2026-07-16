import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["../frontend/packages/ui/src", "../frontend/apps"];
const hex = /#[0-9a-fA-F]{3,8}\b/;
const bad = [];

function shouldSkip(name, p) {
  if (name === "node_modules" || name === "dist" || name === ".next") return true;
  if (p.includes("node_modules") || p.includes("/.next/")) return true;
  if (name.endsWith("tokens.css") || name.endsWith("tokens.generated.css")) return true;
  return false;
}

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (shouldSkip(name, p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(name)) {
      const text = readFileSync(p, "utf8");
      if (hex.test(text)) bad.push(p);
    }
  }
}

for (const r of roots) walk(join(process.cwd(), r));
if (bad.length) {
  console.error("Gate B FAIL — hardcode màu hex:\n" + bad.join("\n"));
  process.exit(1);
}
console.log("Gate B OK — không hex cứng trong UI/apps (ngoài tokens).");
