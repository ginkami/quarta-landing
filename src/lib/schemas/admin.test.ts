import { describe, expect, it } from "vitest";
import { commentSchema, leadIdSchema, loginSchema, processedSchema, statusFilterSchema } from "./admin";

const UUID = "3f6a2f6e-1f2b-4c9d-8a1b-9d8c7e6f5a4b";

describe("admin schemas", () => {
  it("loginSchema requires a non-empty password", () => {
    expect(loginSchema.safeParse({ password: "secret" }).success).toBe(true);
    expect(loginSchema.safeParse({ password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });

  it("leadIdSchema accepts uuids only", () => {
    expect(leadIdSchema.safeParse(UUID).success).toBe(true);
    expect(leadIdSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(leadIdSchema.safeParse(42).success).toBe(false);
  });

  it("commentSchema accepts null, empty and up to 2000 characters", () => {
    expect(commentSchema.safeParse(null).success).toBe(true);
    expect(commentSchema.safeParse("").success).toBe(true);
    expect(commentSchema.safeParse("x".repeat(2000)).success).toBe(true);
    expect(commentSchema.safeParse("x".repeat(2001)).success).toBe(false);
    expect(commentSchema.safeParse(123).success).toBe(false);
  });

  it("statusFilterSchema accepts exactly the three filter values", () => {
    expect(statusFilterSchema.safeParse("all").success).toBe(true);
    expect(statusFilterSchema.safeParse("unprocessed").success).toBe(true);
    expect(statusFilterSchema.safeParse("processed").success).toBe(true);
    expect(statusFilterSchema.safeParse("anything").success).toBe(false);
  });

  it("processedSchema accepts booleans only", () => {
    expect(processedSchema.safeParse(true).success).toBe(true);
    expect(processedSchema.safeParse(false).success).toBe(true);
    expect(processedSchema.safeParse("true").success).toBe(false);
  });
});
