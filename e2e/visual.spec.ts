import { expect, test, type Page } from "@playwright/test";

async function createShareLink(page: Page, gender: "son" | "daughter") {
  await page.goto("/gender-reveal");
  await page.getByLabel("아기 태명").fill(gender === "son" ? "복덩이" : "깡총이");
  await page.getByLabel("출산 예정일").fill("2026-12-25");
  await page.getByLabel("받는 사람").fill("할머니, 할아버지");
  await page.locator(`label[for='gender-${gender}']`).click();
  await page.locator("button[type='submit']").click();
  await expect(page.getByText("풍선이 완성되었어요!")).toBeVisible();
  return page.locator("input[readonly]").inputValue();
}

async function completeBalloon(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
  for (let i = 0; i < 10; i++) await touchButton.click();
}

test.describe("Visual Captures", () => {
  test("captures the complete creator, interaction, and result state matrix", async ({ page }, testInfo) => {
    const prefix = `e2e/screenshots/local/${testInfo.project.name}`;
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/gender-reveal");
    await page.screenshot({ path: `${prefix}-creator-empty.png` });

    await page.getByRole("button", { name: /젠더리빌 풍선 만들기/i }).click();
    await page.screenshot({ path: `${prefix}-creator-invalid.png` });

    await page.getByLabel("아기 태명").fill("복덩이");
    await page.getByLabel("출산 예정일").fill("2026-10-10");
    await page.getByLabel("받는 사람").fill("이모");
    await page.locator("label[for='gender-son']").click({ force: true });
    await expect(page.locator("#gender-son")).toBeChecked();
    await page.screenshot({ path: `${prefix}-creator-son-selected.png` });
    await page.locator("label[for='gender-daughter']").click({ force: true });
    await expect(page.locator("#gender-daughter")).toBeChecked();
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${prefix}-creator-daughter-selected.png` });

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(page.url()).origin,
    });
    await page.locator("button[type='submit']").click();
    await expect(page.getByText("풍선이 완성되었어요!")).toBeVisible();
    await page.screenshot({ path: `${prefix}-share-dialog.png` });
    await page.getByRole("button", { name: "공유 링크 복사" }).click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.screenshot({ path: `${prefix}-copy-toast.png` });

    const daughterShareLink = await page.locator("input[readonly]").inputValue();
    await page.getByRole("button", { name: "닫기" }).click();
    await page.goto(daughterShareLink);
    await page.screenshot({ path: `${prefix}-balloon-0.png` });

    const touchButton = page.getByRole("button", { name: /풍선 터치하기/i });
    for (let i = 0; i < 9; i++) await touchButton.click();
    await page.screenshot({ path: `${prefix}-balloon-9.png` });

    await page.emulateMedia({ reducedMotion: ["no-", ["pre", "ference"].join("")].join("") });
    await touchButton.evaluate((element) => (element as HTMLButtonElement).click());
    await page.screenshot({ path: `${prefix}-burst.png` });
    await expect(page.getByText("'딸'이에요!")).toBeVisible();
    await page.screenshot({ path: `${prefix}-result-daughter.png` });

    const sonShareLink = await createShareLink(page, "son");
    await page.goto(sonShareLink);
    await completeBalloon(page);
    await expect(page.getByText("'아들'이에요!")).toBeVisible();
    await page.screenshot({ path: `${prefix}-result-son.png` });

    await page.goto("/gender-reveal/invalid-non-existent-token");
    await expect(page.getByText("존재하지 않는 젠더리빌 링크입니다")).toBeVisible();
    await page.screenshot({ path: `${prefix}-unknown-link.png` });

    await page.goto("/gender-reveal");
    const form = page.locator("form");
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBe(testInfo.project.name === "desktop" ? 380 : 318);
  });

  test("captures the operational error state", async ({ page }, testInfo) => {
    test.skip(!process.env.OPERATIONAL_ERROR_BASE_URL, "Requires a server with an unavailable database");
    await page.goto(
      `${process.env.OPERATIONAL_ERROR_BASE_URL}/gender-reveal/operational-error-token`
    );
    await expect(page.getByText("링크를 불러오지 못했어요")).toBeVisible();
    await page.screenshot({
      path: `e2e/screenshots/local/${testInfo.project.name}-operational-error.png`,
    });
  });
});
