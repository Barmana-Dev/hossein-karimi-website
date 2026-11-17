import { test, expect } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://localhost:4000";

test.describe("صفحات عمومی", () => {
  test("صفحهٔ اصلی بارگذاری می‌شود", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("صفحهٔ مقالات فهرست را نشان می‌دهد", async ({ page }) => {
    const response = await page.goto("/insights");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("صفحهٔ شبکهٔ کارگزاری‌ها باز می‌شود", async ({ page }) => {
    const response = await page.goto("/network");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("فرم تماس فیلدهای ضروری را دارد", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByPlaceholder("مثلاً: علی محمدی")).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("موضوع پیام شما...")).toBeVisible();
  });

  test("صفحهٔ ورود فرم ورود را نشان می‌دهد", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("مسیر ناموجود صفحهٔ ۴۰۴ فارسی نشان می‌دهد", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-123");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByText("صفحه‌ای که دنبالش بودید پیدا نشد"),
    ).toBeVisible();
  });
});

test.describe("سئو و سلامت سرویس", () => {
  test("sitemap.xml معتبر است", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<urlset");
  });

  test("robots.txt موجود است", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sitemap");
  });

  test("API سالم است", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).status).toBe("ok");
  });
});
