import { expect, test } from "@playwright/test";

/**
 * Pilot Gate C — vài story đại diện design system / gia phả.
 * Story id = kebab(title)--kebab(export) (Storybook 8).
 */
const stories = [
  { id: "button--primary", name: "button-primary" },
  { id: "alert--info", name: "alert-info" },
  { id: "publicheader--default", name: "public-header" },
  { id: "datatable--default", name: "data-table" },
  { id: "giapha-giocard--default", name: "gio-card" },
] as const;

for (const story of stories) {
  test(`visual: ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, {
      waitUntil: "networkidle",
    });
    // Chờ font/token ổn định
    await page.waitForTimeout(300);
    const root = page.locator("#storybook-root");
    await expect(root).toBeVisible();
    await expect(root).toHaveScreenshot(`${story.name}.png`);
  });
}
