import { test, expect, type Page } from "@playwright/test";

const appConsoleErrors = new WeakMap<Page, string[]>();

async function createShareLink(
  page: Page,
  gender: "son" | "daughter" = "son"
) {
  await page.goto("/gender-reveal");
  await page.getByLabel(/아기 태명/i).fill("깡총이");
  await page.getByLabel(/출산 예정일/i).fill("2026-12-25");
  await page.getByLabel(/받는 사람/i).fill("할머니, 할아버지");
  await page.locator(`label[for='gender-${gender}']`).click();
  await page.locator("button[type='submit']").click();
  await expect(page.getByText("풍선이 완성되었어요!")).toBeVisible();
  return page.locator("input[readonly]").inputValue();
}

async function completeBalloon(page: Page) {
  const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
  for (let i = 0; i < 10; i++) await touchButton.click();
}

test.describe("Gender Reveal E2E Journey", () => {
  test.beforeEach(async ({ page }) => {
    const uncaughtErrors: string[] = [];
    appConsoleErrors.set(page, uncaughtErrors);
    page.on("pageerror", (error) => uncaughtErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") uncaughtErrors.push(message.text());
    });
    await page.addInitScript((errors) => {
      window.addEventListener("unload", () => {
        if (errors.length) console.error(errors.join(" | "));
      });
    }, uncaughtErrors);
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test.afterEach(async ({ page }, testInfo) => {
    const errors = appConsoleErrors.get(page) ?? [];
    const unexpectedErrors = testInfo.title.includes("server creation failure")
      ? errors.filter((error) => !error.includes("status of 500"))
      : errors;
    expect(unexpectedErrors).toEqual([]);
  });
  test("downloads the result image without application console errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/gender-reveal");
    await page.getByLabel(/아기 태명/i).fill("깡총이");
    await page.getByLabel(/출산 예정일/i).fill("2026-12-25");
    await page.getByLabel(/받는 사람/i).fill("할머니, 할아버지");
    await page.locator("label[for='gender-son']").click();
    await page.locator("button[type='submit']").click();
    await expect(page.getByText("풍선이 완성되었어요!")).toBeVisible();

    const shareLink = await page.locator("input[readonly]").inputValue();
    await page.goto(shareLink);
    const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
    for (let i = 0; i < 10; i++) await touchButton.click();

    await expect(page.getByText("'아들'이에요!")).toBeVisible({ timeout: 5000 });
    const saveButton = page.getByRole("button", { name: "결과 저장하기" });
    await expect(saveButton).toBeEnabled({ timeout: 15000 });
    const downloadPromise = page.waitForEvent("download");
    await saveButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("gender-reveal-son.png");
    expect(consoleErrors).toEqual([]);
  });

  test("creates a daughter reveal and completes 10-tap balloon interaction", async ({
    page,
  }) => {
    await page.goto("/gender-reveal");

    // Fill creator form
    await page.getByLabel(/아기 태명/i).fill("깡총이");
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

    await page.getByLabel(/아기 태명/i).fill("복덩이");
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

  test("copies a created reveal link to the clipboard", async ({ page }) => {
    await page.goto("/gender-reveal");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });
    const shareLink = await createShareLink(page);
    await page.getByRole("button", { name: "공유 링크 복사" }).click();
    await expect(page.getByRole("status")).toHaveText("복사가 완료 되었습니다.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shareLink);
  });

  test("shows a manual-copy message when clipboard access fails", async ({ page }) => {
    await page.goto("/gender-reveal");
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => Promise.reject(new Error("denied")) },
      });
    });
    await createShareLink(page);
    await page.getByRole("button", { name: "공유 링크 복사" }).click();
    await expect(page.locator('[role="alert"]').filter({ hasText: "복사에 실패했어요" })).toHaveText(
      "복사에 실패했어요. 링크를 직접 선택해 복사해주세요"
    );
  });

  test("replays a completed reveal from the result screen", async ({ page }) => {
    const shareLink = await createShareLink(page);
    await page.goto(shareLink);
    await completeBalloon(page);
    await expect(page.getByText("'아들'이에요!")).toBeVisible();
    await page.getByRole("button", { name: "‹ 뒤로가기" }).click();
    await expect(page.getByText("0 / 10")).toBeVisible();
  });

  test("returns to the creator when starting a new reveal", async ({ page }) => {
    const shareLink = await createShareLink(page);
    await page.goto(shareLink);
    await completeBalloon(page);
    await expect(page.getByText("'아들'이에요!")).toBeVisible();
    await page.getByRole("button", { name: "젠더리빌 새로 만들기" }).click();
    await expect(page).toHaveURL(/\/gender-reveal$/);
    await expect(page.getByLabel("아기 태명")).toBeVisible();
  });

  test("keeps entered values after a server creation failure", async ({ page }) => {
    await page.route("**/api/reveals", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "temporary failure" }),
      });
    });
    await page.goto("/gender-reveal");
    await page.getByLabel("아기 태명").fill("보름이");
    await page.getByLabel("출산 예정일").fill("2026-11-11");
    await page.getByLabel("받는 사람").fill("가족");
    await page.locator("label[for='gender-daughter']").click();
    await page.locator("button[type='submit']").click();
    await expect(page.locator('[role="alert"]').filter({ hasText: "링크 생성에 실패했어요" })).toHaveText(
      "링크 생성에 실패했어요. 다시 시도해주세요"
    );
    await expect(page.getByLabel("아기 태명")).toHaveValue("보름이");
    await expect(page.getByLabel("출산 예정일")).toHaveValue("2026-11-11");
    await expect(page.getByLabel("받는 사람")).toHaveValue("가족");
    await expect(page.locator("#gender-daughter")).toBeChecked();
  });

  test("completes the reveal with mobile touchscreen taps", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Touchscreen coverage is mobile-only");
    const shareLink = await createShareLink(page, "daughter");
    await page.goto(shareLink);
    const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
    const box = await touchButton.boundingBox();
    if (!box) throw new Error("Balloon button has no layout box");
    for (let i = 0; i < 10; i++) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    }
    await expect(page.getByText("'딸'이에요!")).toBeVisible();
  });
});
