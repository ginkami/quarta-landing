import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/** The Playwright runner does not load .env.local; read the value directly. */
function readEnvLocal(key: string): string | undefined {
  try {
    const raw = readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match?.[1] === key) {
        return match[2]?.replace(/^"([^"]*)"$/, "$1").replace(/^'([^']*)'$/, "$1");
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

const ADMIN_PASSWORD = readEnvLocal("ADMIN_PASSWORD") ?? "";
if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD is missing from .env.local");
}

/**
 * A unique client IP per run keeps the in-memory rate limiters clean across
 * runs. Dev servers read `x-forwarded-for` straight from the request; Vercel
 * overwrites the header in production, so this is a local-testing trick only.
 */
async function useFreshIp(page: Page): Promise<void> {
  const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`;
  await page.context().setExtraHTTPHeaders({ "x-forwarded-for": ip });
}

async function submitLead(page: Page, name: string, phone: string): Promise<void> {
  await page.goto("/");
  await page.locator('a[href="#request"]').first().click();
  await page.getByLabel("Имя").fill(name);
  await page.getByLabel("Телефон").fill(phone);
  await page.getByRole("radio", { name: "Разовый заказ" }).click();
  await page.getByRole("button", { name: "Отправить заявку" }).click();
  await expect(page.getByText("Заявка принята!")).toBeVisible({ timeout: 20_000 });
}

async function login(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Пароль").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("admin logs in with the password and sees the freshly submitted lead", async ({ page }) => {
  test.setTimeout(60_000);
  await useFreshIp(page);

  await submitLead(page, "Тест Плейрайт", "+375290000000");

  // Unauthenticated visit bounces to the login page.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);

  // A wrong password shows a Russian error and stays on the login page.
  await page.getByLabel("Пароль").fill("wrong-password");
  await page.getByRole("button", { name: "Войти" }).click();
  // Scoped to the form: Next's route announcer also exposes role="alert".
  await expect(page.locator("form").getByRole("alert")).toHaveText("Неверный пароль.");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await login(page);

  await expect(
    page.getByRole("heading", { name: "Тест Плейрайт" }).first(),
  ).toBeVisible({ timeout: 15_000 });
});

test("admin toggles status, filters, edits the comment and deletes with confirmation", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await useFreshIp(page);

  await submitLead(page, "Тест Мутации", "+375294445566");

  await page.goto("/admin");
  await login(page);

  const card = () =>
    page.locator("li").filter({ has: page.getByRole("heading", { name: "Тест Мутации" }) });
  await expect(card()).toBeVisible({ timeout: 15_000 });

  // Status toggle persists across a reload. Normalize first: a previous
  // interrupted run may have left the test row in either state.
  const checkbox = card().getByRole("checkbox");
  if (!(await checkbox.isChecked())) {
    await checkbox.click();
  }
  await expect(checkbox).toBeChecked();
  await page.reload();
  await expect(card().getByRole("checkbox")).toBeChecked({ timeout: 15_000 });

  // Status filter narrows the list (exact names: «Обработана» is a substring of «Не обработана»).
  await page.getByRole("radio", { name: "Обработанные", exact: true }).click();
  await expect(card()).toBeVisible();
  await page.getByRole("radio", { name: "Необработанные", exact: true }).click();
  await expect(card()).toBeHidden();
  await page.getByRole("radio", { name: "Все", exact: true }).click();
  await expect(card()).toBeVisible();

  // Comment: save, then clear. Exact names: «Комментарий» is a substring of
  // «Удалить комментарий», and the modal must be gone before reopening.
  await card()
    .getByRole("button", { name: "Редактировать комментарий", exact: true })
    .click();
  await page.getByLabel("Комментарий", { exact: true }).fill("Комментарий из смоука");
  await page.getByRole("button", { name: "Принять", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15_000 });
  await expect(card().getByText("Комментарий из смоука")).toBeVisible({ timeout: 15_000 });

  await card()
    .getByRole("button", { name: "Редактировать комментарий", exact: true })
    .click();
  await page.getByRole("button", { name: "Удалить комментарий", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15_000 });
  await expect(card().getByText("Без комментария")).toBeVisible({ timeout: 15_000 });

  // Refresh reflects current data.
  await page.getByRole("button", { name: "Обновить" }).click();
  await expect(card()).toBeVisible({ timeout: 15_000 });

  // Deletion: cancel first, then confirm.
  await card().getByRole("button", { name: "Удалить", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Удалить заявку" })).toBeVisible();
  await page.getByRole("button", { name: "Отмена" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await card().getByRole("button", { name: "Удалить", exact: true }).click();
  await page.getByRole("button", { name: "Удалить заявку" }).click();
  await expect(card()).toBeHidden({ timeout: 15_000 });
});
