import { expect, test } from "@playwright/test";

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

    const form = page.locator("form");
    expect(await form.boundingBox()).toMatchObject({ width: 380 });
    expect(await page.getByLabel("아기 태명").evaluate((el) => el.getBoundingClientRect().height)).toBe(48);
    expect(await page.getByLabel("출산 예정일").evaluate((el) => el.getBoundingClientRect().height)).toBe(48);
    expect(await page.getByLabel("아기 성별").locator("..").evaluate((el) => el.querySelector("label")!.getBoundingClientRect().height)).toBe(50);
    expect(await page.getByRole("button", { name: /젠더리빌 풍선 만들기/i }).evaluate((el) => el.getBoundingClientRect().height)).toBe(60);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
