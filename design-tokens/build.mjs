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
/* semantic extensions (Gate B: UI chỉ dùng var) */
:root {
  --color-border-default: var(--color-ink-700);
  --color-border-subtle: color-mix(in srgb, var(--color-ink-700) 20%, transparent);
  --color-status-success-bg: color-mix(in srgb, var(--color-nghe-400) 25%, var(--color-paper-0));
  --color-status-success-fg: var(--color-ink-900);
  --color-status-error-bg: color-mix(in srgb, var(--color-son-500) 15%, var(--color-paper-0));
  --color-status-error-fg: var(--color-son-600);
  --color-status-info-bg: color-mix(in srgb, var(--color-heritage-accent, var(--color-nghe-400)) 20%, var(--color-paper-0));
  --color-status-info-fg: var(--color-ink-900);
  --color-focus-ring: var(--color-heritage-accent, var(--color-nghe-400));
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --shadow-sm: 0 1px 2px color-mix(in srgb, var(--color-ink-900) 8%, transparent);
  --shadow-md: 0 4px 12px color-mix(in srgb, var(--color-ink-900) 12%, transparent);
}
`;

writeFileSync(
  join(outDir, "tokens.css"),
  `/* AUTO — pnpm tokens:build từ design-tokens/ */\n${generated}\n${extensions}`,
);
writeFileSync(join(outDir, "index.ts"), `export const tokensReady = true;\n`);
console.log("tokens built → frontend/packages/tokens/src/tokens.css");
