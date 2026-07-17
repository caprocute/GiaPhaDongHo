import StyleDictionary from "style-dictionary";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../frontend/packages/tokens/src");

/** Flatten DTCG color tree → CSS custom properties (kebab, lower). */
function flattenColorTokens(node, path = []) {
  const out = [];
  for (const [key, val] of Object.entries(node)) {
    const next = [...path, key];
    if (val && typeof val === "object" && "$value" in val) {
      const name = `--color-${next.map((p) => p.toLowerCase()).join("-")}`;
      out.push(`  ${name}: ${String(val.$value).toLowerCase()};`);
    } else if (val && typeof val === "object") {
      out.push(...flattenColorTokens(val, next));
    }
  }
  return out;
}

function loadPalette(file) {
  const json = JSON.parse(readFileSync(join(__dirname, file), "utf8"));
  return flattenColorTokens(json.color).join("\n");
}

function extractRootBlock(css) {
  const m = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  return m ? m[1] : "";
}

function declsMatching(block, pred) {
  return block
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => {
      const t = l.trim();
      if (!t.startsWith("--")) return false;
      const name = t.slice(2, t.indexOf(":"));
      return pred(name);
    })
    .join("\n");
}

const bangVangPrim = loadPalette("primitive/color.bang-vang.tokens.json");
const coPrim = loadPalette("primitive/color.co.tokens.json");

const sd = new StyleDictionary({
  source: [
    join(__dirname, "primitive/color.bang-vang.tokens.json"),
    join(__dirname, "semantic/**/*.tokens.json"),
  ],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: `${outDir}/`,
      files: [
        {
          destination: "tokens.generated.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
mkdirSync(outDir, { recursive: true });

const generated = readFileSync(join(outDir, "tokens.generated.css"), "utf8");
const rootBody = extractRootBlock(generated);

const nonColorDecls = declsMatching(
  rootBody,
  (name) => !name.startsWith("color-"),
);

const semanticLight = `
  --color-status-success: var(--color-status-good-l);
  --color-status-warning: var(--color-status-warn-l);
  --color-status-danger: var(--color-status-bad-l);
  --color-action-primary-bg: var(--color-gold-500);
  --color-action-primary-bg-hover: var(--color-son-400);
  --color-action-primary-bg-deep: var(--color-son-700);
  --color-action-primary-fg: var(--color-son-ink);
  --color-text-primary: var(--color-ink-900);
  --color-text-muted: var(--color-ink-700);
  --color-text-on-brand: var(--color-son-ink);
  --color-surface-page: var(--color-bg-l1);
  --color-surface-card: var(--color-bg-l0);
  --color-surface-sunken: var(--color-bg-l2);
  --color-border-default: var(--color-line-l);
  --color-border-strong: var(--color-line-l-strong);
  --color-heritage-accent: var(--color-gold-400);
  --color-heritage-deep: var(--color-gold-500);
  --color-heritage-soft: var(--color-gold-soft);
  --color-heritage-line: var(--color-gold-line);
  --color-heritage-frame: var(--color-son-700);
`.trimEnd();

const semanticDark = `
  --color-status-success: var(--color-status-good-d);
  --color-status-warning: var(--color-status-warn-d);
  --color-status-danger: var(--color-status-bad-d);
  --color-action-primary-bg: var(--color-gold-d500);
  --color-action-primary-bg-hover: var(--color-gold-d400);
  --color-action-primary-bg-deep: var(--color-son-d700);
  --color-action-primary-fg: var(--color-son-d-ink);
  --color-text-primary: var(--color-ink-d900);
  --color-text-muted: var(--color-ink-d700);
  --color-text-on-brand: var(--color-son-d-ink);
  --color-surface-page: var(--color-bg-d1);
  --color-surface-card: var(--color-bg-d0);
  --color-surface-sunken: var(--color-bg-d2);
  --color-border-default: var(--color-line-d);
  --color-border-strong: var(--color-line-d-strong);
  --color-heritage-accent: var(--color-gold-d400);
  --color-heritage-deep: var(--color-gold-d500);
  --color-heritage-soft: var(--color-gold-d-soft);
  --color-heritage-line: var(--color-gold-d-line);
  --color-heritage-frame: var(--color-son-d700);
`.trimEnd();

const extensionsShared = `
  --color-border-subtle: color-mix(in srgb, var(--color-border-default) 55%, transparent);
  --color-status-success-bg: color-mix(in srgb, var(--color-status-success) 22%, var(--color-surface-card));
  --color-status-success-fg: var(--color-text-primary);
  --color-status-error-bg: color-mix(in srgb, var(--color-status-danger) 14%, var(--color-surface-card));
  --color-status-error-fg: var(--color-action-primary-bg);
  --color-status-info-bg: color-mix(in srgb, var(--color-heritage-accent) 18%, var(--color-surface-card));
  --color-status-info-fg: var(--color-text-primary);
  --color-focus-ring: var(--color-heritage-accent);
  --font-heading: var(--font-display);
  --font-size-xs: 0.6875rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-display: clamp(1.75rem, 3vw, 2.5rem);
  --shadow-sm: 0 1px 2px color-mix(in srgb, var(--color-text-primary) 5%, transparent),
    0 10px 30px color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  --shadow-md: 0 2px 6px color-mix(in srgb, var(--color-text-primary) 8%, transparent),
    0 20px 48px color-mix(in srgb, var(--color-text-primary) 16%, transparent);
  --gradient-foil: linear-gradient(
    105deg,
    var(--color-heritage-deep) 0%,
    var(--color-heritage-accent) 22%,
    var(--color-heritage-soft) 50%,
    var(--color-heritage-accent) 78%,
    var(--color-heritage-deep) 100%
  );
`.trimEnd();

const patternsBangVang = `
  --pattern-brocade: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cpath d='M36 2L70 36 36 70 2 36Z' fill='none' stroke='rgba(226,175,29,.14)'/%3E%3Cpath d='M36 26v20M26 36h20' stroke='rgba(174,114,12,.10)'/%3E%3Ccircle cx='36' cy='36' r='3.5' fill='none' stroke='rgba(226,175,29,.16)'/%3E%3C/svg%3E");
  --pattern-meander: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M3.5 19V6.5h12v8h-8v-4h4' fill='none' stroke='%23E2AF1D' stroke-width='1.8'/%3E%3C/svg%3E");
  --pattern-tho: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Ccircle cx='75' cy='75' r='62' fill='none' stroke='rgba(226,175,29,.14)' stroke-width='1.5'/%3E%3Ccircle cx='75' cy='75' r='52' fill='none' stroke='rgba(174,114,12,.10)'/%3E%3Ctext x='75' y='97' text-anchor='middle' font-family='Georgia,serif' font-size='64' fill='rgba(226,175,29,.14)'%3E%E5%A3%BD%3C/text%3E%3C/svg%3E");
`.trimEnd();

const patternsCo = `
  --pattern-brocade: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cpath d='M36 2L70 36 36 70 2 36Z' fill='none' stroke='rgba(201,162,39,.14)'/%3E%3Cpath d='M36 26v20M26 36h20' stroke='rgba(142,42,26,.10)'/%3E%3Ccircle cx='36' cy='36' r='3.5' fill='none' stroke='rgba(201,162,39,.16)'/%3E%3C/svg%3E");
  --pattern-meander: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M3.5 19V6.5h12v8h-8v-4h4' fill='none' stroke='%23C9A227' stroke-width='1.8'/%3E%3C/svg%3E");
  --pattern-tho: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Ccircle cx='75' cy='75' r='62' fill='none' stroke='rgba(201,162,39,.14)' stroke-width='1.5'/%3E%3Ccircle cx='75' cy='75' r='52' fill='none' stroke='rgba(142,42,26,.10)'/%3E%3Ctext x='75' y='97' text-anchor='middle' font-family='Georgia,serif' font-size='64' fill='rgba(201,162,39,.14)'%3E%E5%A3%BD%3C/text%3E%3C/svg%3E");
`.trimEnd();

const css = `/* AUTO — pnpm tokens:build từ design-tokens/ */
/**
 * Theme API:
 *   data-palette="bang-vang" | "co"
 *   data-mode="light" | "dark"   (resolved; system → light|dark trên <html>)
 */

/* —— Primitives: palette Bảng vàng (mặc định) —— */
:root,
[data-palette="bang-vang"] {
${bangVangPrim}
${patternsBangVang}
}

/* —— Primitives: palette Cổ (son đỏ / kem) —— */
[data-palette="co"] {
${coPrim}
${patternsCo}
}

/* —— Non-color foundations (spacing, radius, font) —— */
:root {
${nonColorDecls}
${extensionsShared}
}

/* —— Semantic: light (mặc định) —— */
:root,
[data-mode="light"] {
${semanticLight}
}

/* —— Semantic: dark —— */
[data-mode="dark"] {
${semanticDark}
}
`;

writeFileSync(join(outDir, "tokens.generated.css"), generated);
writeFileSync(join(outDir, "tokens.css"), css);
writeFileSync(join(outDir, "index.ts"), `export const tokensReady = true;\n`);
console.log("tokens built → frontend/packages/tokens/src/tokens.css (palette × mode)");
