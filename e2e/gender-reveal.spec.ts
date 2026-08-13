import { test, expect } from "@playwright/test";

test.describe("Gender Reveal E2E Journey", () => {
  test("creates a daughter reveal and completes 10-tap balloon interaction", async ({
    page,
  }) => {
    await page.goto("/gender-reveal");

    // Fill creator form
    await page.getByLabel(/아기 별명/i).fill("깡총이");
    await page.getByLabel(/출산 예정일/i).fill("2026-12-25");
    await page.getByLabel(/받는 사람/i).fill("할머니, 할아버지");
    await page.locator("label[for='gender-daughter']").click();

    // Submit form
    await page.locator("button[type='submit']").click();

    // Wait for dialog
    await expect(page.getByText("풍선이 완성되었어요!")).toBeVisible();

    // Get the share link from read-only input
    const shareInput = page.locator("input[readonly]");
    const shareLink = await shareInput.inputValue();
    expect(shareLink).toContain("/gender-reveal/");

    // Navigate to recipient page
    await page.goto(shareLink);

    // Initial state check
    await expect(page.getByText("0 / 10")).toBeVisible();
    await expect(page.getByText(/아들일까요\? 딸일까요\?/)).toBeVisible();

    // Tap balloon 10 times
    const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
    for (let i = 0; i < 10; i++) {
      await touchButton.click();
    }

    // Wait for burst transition and result
    await expect(page.getByText("'딸'이에요!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("할머니, 할아버지!")).toBeVisible();
    await expect(page.getByText("2026년 12월 25일에")).toBeVisible();

    // Refresh recipient link and verify reset to 0 / 10
    await page.reload();
    await expect(page.getByText("0 / 10")).toBeVisible();
  });

  test("creates a son reveal and verifies result", async ({ page }) => {
    await page.goto("/gender-reveal");

    await page.getByLabel(/아기 별명/i).fill("복덩이");
    await page.getByLabel(/출산 예정일/i).fill("2026-10-10");
    await page.getByLabel(/받는 사람/i).fill("이모");
    await page.locator("label[for='gender-son']").click();

    await page.locator("button[type='submit']").click();
    await expect(page.getByText("풍선이 완성되었어요!")).toBeVisible();

    const shareLink = await page.locator("input[readonly]").inputValue();
    await page.goto(shareLink);

    const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
    for (let i = 0; i < 10; i++) {
      await touchButton.click();
    }

    await expect(page.getByText("'아들'이에요!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("이모!")).toBeVisible();
  });

  test("renders missing reveal screen for invalid token", async ({ page }) => {
    await page.goto("/gender-reveal/invalid-non-existent-token");
    await expect(
      page.getByText("존재하지 않는 젠더리빌 링크입니다")
    ).toBeVisible();
  });

  test("shows form validation errors when submitted empty", async ({ page }) => {
    await page.goto("/gender-reveal");
    await page.locator("button[type='submit']").click();
    await expect(page.getByText("정보를 모두 입력해주세요")).toBeVisible();
  });
});
