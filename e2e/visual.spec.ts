import { test } from "@playwright/test";

test.describe("Visual Captures", () => {
  test("captures creator and result screens", async ({ page }, testInfo) => {
    await page.goto("/gender-reveal");
    await page.screenshot({
      path: `e2e/screenshots/local/${testInfo.project.name}-creator-empty.png`,
    });

    await page.getByRole("button", { name: /젠더리빌 풍선 만들기/i }).click();
    await page.screenshot({
      path: `e2e/screenshots/local/${testInfo.project.name}-creator-validation.png`,
    });
  });
});
