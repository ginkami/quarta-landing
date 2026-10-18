import { describe, expect, it } from "vitest";
import { summarizeTouch } from "./summarize-touch";

describe("summarizeTouch", () => {
  it("orders utm, click id, referrer and landing chips", () => {
    const chips = summarizeTouch({
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "degustation",
      fbclid: "IwAR2xyz",
      referrer: "https://instagram.com/quarta-roast",
      landing: "https://quarta-roast.by/?utm_source=instagram",
    });
    expect(chips.map((chip) => chip.kind)).toEqual([
      "utm",
      "utm",
      "utm",
      "click",
      "referrer",
      "landing",
    ]);
    expect(chips.map((chip) => chip.label)).toEqual([
      "instagram",
      "social",
      "degustation",
      "IwAR2xyz",
      "instagram.com",
      "/?utm_source=instagram",
    ]);
    expect(chips[0]?.title).toBe("utm_source=instagram");
  });

  it("keeps a non-URL referrer as-is", () => {
    const chips = summarizeTouch({ referrer: "not a url" });
    expect(chips.map((chip) => chip.label)).toEqual(["not a url"]);
  });

  it("keeps a non-URL landing as-is", () => {
    const chips = summarizeTouch({ landing: "about:blank" });
    expect(chips.map((chip) => chip.label)).toEqual(["about:blank"]);
  });

  it("returns no chips for an empty touch", () => {
    expect(summarizeTouch({})).toEqual([]);
  });

  it("ignores unknown keys and empty values", () => {
    const chips = summarizeTouch({ junk: "value", utm_source: "" });
    expect(chips).toEqual([]);
  });
});
