import { defineConfig, devices } from "@playwright/test";

/**
 * Gate C — visual regression trên Storybook static (pilot).
 * Baseline trong visual/...-snapshots (commit vào repo; cập nhật bằng --update-snapshots trên Linux/CI).
 */
export default defineConfig({
  testDir: "./visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  // Một bộ baseline (sinh trên Linux/CI) — tránh suffix -darwin/-linux
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      // Baseline thường sinh trên máy local; CI Linux có thể lệch font AA → 1%
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:6006",
    viewport: { width: 1280, height: 720 },
    colorScheme: "light",
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dlx serve packages/ui/storybook-static -l 6006 --no-clipboard",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
