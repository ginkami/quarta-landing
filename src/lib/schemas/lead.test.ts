import { describe, expect, it } from "vitest";
import { formatPhoneInput, interestLabel, leadSchema, normalizePhone } from "./lead";

describe("phone acceptance rules", () => {
  it("normalizes a formatted Belarusian number to E.164", () => {
    const result = leadSchema.safeParse({
      name: "Аня",
      phone: "+375 (29) 123-45-67",
      interest: "subscription",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+375291234567");
    }
  });

  it("accepts any nine-digit subscriber number after +375", () => {
    for (const phone of ["+375 17 123 45 67", "+375 (16) 512-04-97", "+375165120497", "+375291234567"]) {
      const result = leadSchema.safeParse({ name: "Тест", phone, interest: "question" });
      expect(result.success, phone).toBe(true);
    }
  });

  it.each([
    ["80291234567", "domestic 8-prefix"],
    ["+7 999 123 45 67", "Russian +7 number"],
    ["+375 12 345", "too short"],
    ["+37529123456", "eleven digits"],
    ["+3752912345678", "thirteen digits"],
    ["", "empty"],
  ])("rejects %s (%s)", (phone) => {
    const result = leadSchema.safeParse({
      name: "Тест",
      phone,
      interest: "question",
    });
    expect(result.success).toBe(false);
  });

  it("reports a Russian hint for an invalid phone", () => {
    const result = leadSchema.safeParse({
      name: "Тест",
      phone: "12345",
      interest: "question",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path[0] === "phone");
      expect(issue?.message).toContain("+375");
    }
  });

  it("normalizePhone strips separators only", () => {
    expect(normalizePhone("+375-(29)-123-45-67")).toBe("+375291234567");
    expect(normalizePhone("+375 29 123 45 67")).toBe("+375291234567");
  });
});

describe("lead schema fields", () => {
  it("requires a name of at least two characters", () => {
    expect(leadSchema.safeParse({ name: "А", phone: "+375291234567", interest: "question" }).success).toBe(false);
    expect(leadSchema.safeParse({ name: "Аня", phone: "+375291234567", interest: "question" }).success).toBe(true);
  });

  it("requires a known interest value", () => {
    const result = leadSchema.safeParse({ name: "Аня", phone: "+375291234567", interest: "wholesale" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path[0] === "interest");
      expect(issue?.message).toBe("Выберите, что вас интересует");
    }
  });

  it("treats the comment as optional and trims it", () => {
    const withoutComment = leadSchema.safeParse({ name: "Аня", phone: "+375291234567", interest: "question" });
    expect(withoutComment.success).toBe(true);
    if (withoutComment.success) {
      expect(withoutComment.data.comment).toBeUndefined();
    }

    const withComment = leadSchema.safeParse({
      name: "Аня",
      phone: "+375291234567",
      interest: "question",
      comment: "  Позвоните после шести  ",
    });
    expect(withComment.success).toBe(true);
    if (withComment.success) {
      expect(withComment.data.comment).toBe("Позвоните после шести");
    }

    const tooLong = leadSchema.safeParse({
      name: "Аня",
      phone: "+375291234567",
      interest: "question",
      comment: "я".repeat(501),
    });
    expect(tooLong.success).toBe(false);
  });
});

describe("formatPhoneInput (format on blur only)", () => {
  it("formats a complete valid number for display", () => {
    expect(formatPhoneInput("+375291234567")).toBe("+375 (29) 123-45-67");
    expect(formatPhoneInput("+375 (16) 512-04-97")).toBe("+375 (16) 512-04-97");
    expect(formatPhoneInput("+375 16 512 04 97")).toBe("+375 (16) 512-04-97");
  });

  it("leaves partial input untouched", () => {
    expect(formatPhoneInput("")).toBe("");
    expect(formatPhoneInput("+")).toBe("+");
    expect(formatPhoneInput("+3")).toBe("+3");
    expect(formatPhoneInput("+37529")).toBe("+37529");
  });

  it("leaves invalid input untouched", () => {
    expect(formatPhoneInput("12345")).toBe("12345");
    expect(formatPhoneInput("+79991234567")).toBe("+79991234567");
    expect(formatPhoneInput("+37529123456")).toBe("+37529123456");
  });
});

describe("interestLabel", () => {
  it("maps known interest values to Russian labels", () => {
    expect(interestLabel("subscription")).toBe("Подписка");
    expect(interestLabel("single_order")).toBe("Разовый заказ");
    expect(interestLabel("question")).toBe("Вопрос");
  });

  it("passes unknown values through unchanged", () => {
    expect(interestLabel("wholesale")).toBe("wholesale");
  });
});
