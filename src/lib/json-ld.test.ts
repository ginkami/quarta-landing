import { describe, expect, it } from "vitest";
import { buildBusinessJsonLd } from "./json-ld";

describe("business JSON-LD", () => {
  it("produces serializable structured data with the required fields", () => {
    const data = buildBusinessJsonLd();
    const roundTrip = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;

    expect(roundTrip["@context"]).toBe("https://schema.org");
    expect(roundTrip["@type"]).toBe("CoffeeShop");
    expect(roundTrip["name"]).toBe("КВАРТА");
    expect(roundTrip["address"]).toMatchObject({
      streetAddress: "ул. Короля, 9",
      addressLocality: "Минск",
    });
    expect(roundTrip["openingHoursSpecification"]).toHaveLength(2);
  });

  it("parses opening hours into days and time range", () => {
    const first = buildBusinessJsonLd().openingHoursSpecification[0];
    expect(first).toMatchObject({
      opens: "08:00",
      closes: "20:00",
    });
    expect(first?.dayOfWeek).toContain("Monday");
  });
});
