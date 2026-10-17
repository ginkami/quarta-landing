import { describe, expect, it } from "vitest";
import { leadSchema, normalizePhone } from "./lead";

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

  it("accepts every allowed operator code", () => {
    for (const code of ["17", "25", "29", "33", "44"]) {
      const result = leadSchema.safeParse({
        name: "Тест",
        phone: `+375 ${code} 123 45 67`,
        interest: "question",
      });
      expect(result.success, `code ${code}`).toBe(true);
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
