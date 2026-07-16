import StyleDictionary from "style-dictionary";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../frontend/packages/tokens/src");

const sd = new StyleDictionary({
  source: [
    join(__dirname, "primitive/**/*.tokens.json"),
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
const extensions = `
/* semantic extensions (Gate B: UI chỉ dùng var) — Di sản sống / mockup */
:root {
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
  --shadow-sm: 0 1px 2px color-mix(in srgb, var(--color-ink-900) 5%, transparent),
    0 10px 30px color-mix(in srgb, var(--color-ink-900) 8%, transparent);
  --shadow-md: 0 2px 6px color-mix(in srgb, var(--color-ink-900) 8%, transparent),
    0 20px 48px color-mix(in srgb, var(--color-ink-900) 16%, transparent);
  --gradient-foil: linear-gradient(
    105deg,
    var(--color-heritage-deep) 0%,
    var(--color-heritage-accent) 22%,
    var(--color-heritage-soft) 50%,
    var(--color-heritage-accent) 78%,
    var(--color-heritage-deep) 100%
  );
  --pattern-brocade: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cpath d='M36 2L70 36 36 70 2 36Z' fill='none' stroke='rgba(176,138,56,.12)'/%3E%3Cpath d='M36 26v20M26 36h20' stroke='rgba(176,138,56,.08)'/%3E%3Ccircle cx='36' cy='36' r='3.5' fill='none' stroke='rgba(176,138,56,.14)'/%3E%3C/svg%3E");
  --pattern-meander: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M3.5 19V6.5h12v8h-8v-4h4' fill='none' stroke='%23C9A227' stroke-width='1.8'/%3E%3C/svg%3E");
  --pattern-tho: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Ccircle cx='75' cy='75' r='62' fill='none' stroke='rgba(176,138,56,.13)' stroke-width='1.5'/%3E%3Ccircle cx='75' cy='75' r='52' fill='none' stroke='rgba(176,138,56,.09)'/%3E%3Ctext x='75' y='97' text-anchor='middle' font-family='Georgia,serif' font-size='64' fill='rgba(176,138,56,.13)'%3E%E5%A3%BD%3C/text%3E%3C/svg%3E");
}
`;

writeFileSync(
  join(outDir, "tokens.css"),
  `/* AUTO — pnpm tokens:build từ design-tokens/ */\n${generated}\n${extensions}`,
);
writeFileSync(join(outDir, "index.ts"), `export const tokensReady = true;\n`);
console.log("tokens built → frontend/packages/tokens/src/tokens.css");
