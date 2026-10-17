import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_COOKIE,
  buildLeadAttribution,
  buildTouch,
  mergeAttribution,
  parseAttributionCookie,
  serializeAttributionCookie,
} from "./attribution";

describe("buildTouch", () => {
  it("captures campaign parameters, click ids, referrer and landing page", () => {
    const touch = buildTouch(
      "https://quarta.example/?utm_source=instagram&utm_campaign=degustation&gclid=G-123",
      "https://www.instagram.com/",
    );

    expect(touch).toEqual({
      utm_source: "instagram",
      utm_campaign: "degustation",
      gclid: "G-123",
      referrer: "https://www.instagram.com/",
      landing: "https://quarta.example/?utm_source=instagram&utm_campaign=degustation&gclid=G-123",
    });
  });

  it("captures a direct visit without campaign fields", () => {
    const touch = buildTouch("https://quarta.example/", undefined);
    expect(touch.utm_source).toBeUndefined();
    expect(touch.landing).toBe("https://quarta.example/");
  });
});

describe("mergeAttribution", () => {
  it("keeps first touch and refreshes last touch across visits", () => {
    const firstVisit = buildTouch("https://quarta.example/?utm_source=instagram&utm_campaign=degustation", undefined);
    const cookie = mergeAttribution(undefined, firstVisit, 1000);

    const secondVisit = buildTouch("https://quarta.example/", "https://www.instagram.com/");
    const merged = mergeAttribution(cookie, secondVisit, 2000);

    expect(merged.first.utm_source).toBe("instagram");
    expect(merged.first.utm_campaign).toBe("degustation");
    expect(merged.last.utm_source).toBeUndefined();
    expect(merged.ts).toBe(2000);
    expect(merged.first).toEqual(firstVisit);
  });
});

describe("cookie roundtrip", () => {
  it("serializes and parses a valid payload", () => {
    const cookie = mergeAttribution(undefined, buildTouch("https://quarta.example/", undefined), 42);
    const parsed = parseAttributionCookie(serializeAttributionCookie(cookie));
    expect(parsed).toEqual(cookie);
  });

  it("ignores malformed or missing cookies", () => {
    expect(parseAttributionCookie(undefined)).toBeUndefined();
    expect(parseAttributionCookie("not-json")).toBeUndefined();
    expect(parseAttributionCookie('{"first":1,"last":2}')).toBeUndefined();
    expect(ATTRIBUTION_COOKIE).toBe("q_attr");
  });
});

describe("buildLeadAttribution", () => {
  it("stores touches plus submission context", () => {
    const cookie = mergeAttribution(
      undefined,
      buildTouch("https://quarta.example/?utm_source=yandex", "https://yandex.ru/"),
      1,
    );
    const attribution = buildLeadAttribution(cookie, {
      submissionPage: "https://quarta.example/",
      userAgent: "Mozilla/5.0",
    });

    expect(attribution.first_touch.utm_source).toBe("yandex");
    expect(attribution.last_touch.utm_source).toBe("yandex");
    expect(attribution.submission_page).toBe("https://quarta.example/");
    expect(attribution.user_agent).toBe("Mozilla/5.0");
  });

  it("keeps attribution present but empty without a cookie", () => {
    const attribution = buildLeadAttribution(undefined, {});
    expect(attribution.first_touch).toEqual({});
    expect(attribution.last_touch).toEqual({});
    expect(attribution.submission_page).toBeUndefined();
    expect(attribution.user_agent).toBeUndefined();
  });
});
