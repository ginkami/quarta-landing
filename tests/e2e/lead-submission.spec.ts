import { expect, test } from "@playwright/test";

test("visitor follows the CTA, submits a lead and sees the confirmation", async ({ page }) => {
  await page.goto("/");

  // Header/hero CTA scrolls to the request section.
  await page.locator('a[href="#request"]').first().click();
  await expect(page).toHaveURL(/#request$/);

  await page.getByLabel("Имя").fill("Тест Плейрайт");
  // Reserved test phone — recognizable test data in the dev database.
  await page.getByLabel("Телефон").fill("+375290000000");
  await page.getByRole("radio", { name: "Разовый заказ" }).click();

  await page.getByRole("button", { name: "Отправить заявку" }).click();

  await expect(page.getByText("Заявка принята!")).toBeVisible({ timeout: 20_000 });
});
