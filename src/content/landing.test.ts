import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assortment, processSteps } from "./landing";

describe("assortment contract", () => {
  it("has exactly four products with the specified titles and prices", () => {
    expect(assortment).toHaveLength(4);
    expect(
      assortment.map((product) => ({ title: product.title, price: product.price })),
    ).toEqual([
      { title: "Эфиопия Иргачеффе", price: 32 },
      { title: "Колумбия Уила", price: 29 },
      { title: "Бразилия Серрадо", price: 26 },
      { title: "Дрип-пакеты, ассорти", price: 18 },
    ]);
  });

  it("references product images that exist under public/images", () => {
    for (const product of assortment) {
      const filePath = join(process.cwd(), "public", product.image.replace(/^\//, ""));
      expect(existsSync(filePath), `missing image: ${product.image}`).toBe(true);
    }
  });
});

describe("process steps contract", () => {
  it("lists the five steps in the specified order", () => {
    expect(processSteps).toEqual([
      "Оставляете заявку на сайте",
      "Менеджер перезванивает и подтверждает заказ",
      "Обжариваем зерно по четвергам",
      "Доставляем в пятницу по Минску или отдаём самовывозом",
      "Зерно у вас на 1–3 день после обжарки",
    ]);
  });
});
