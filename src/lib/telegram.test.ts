import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerEnv } from "@/lib/env";
import { formatLeadMessage, sendLeadNotification } from "./telegram";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const fetchMock = vi.fn<FetchFn>();

vi.mock("@/lib/env", () => ({ getServerEnv: vi.fn() }));

const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

const lead = {
  name: "Аня",
  phone: "+375291234567",
  interest: "subscription",
  comment: "Позвонить после обжарки",
  createdAt: new Date("2026-10-18T12:00:00Z"),
};

function useFullConfig() {
  vi.mocked(getServerEnv).mockReturnValue({
    DATABASE_URL: "postgresql://test",
    ADMIN_PASSWORD: "test-password",
    TELEGRAM_BOT_TOKEN: "test-token",
    TELEGRAM_CHAT_ID: "-10012345",
  });
}

beforeEach(() => {
  useFullConfig();
  fetchMock.mockReset();
  warnSpy.mockClear();
  errorSpy.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("formatLeadMessage", () => {
  it("renders the approved template with Minsk time and mapped interest", () => {
    const message = formatLeadMessage(lead);
    expect(message).toContain("☕ <b>Новая заявка — КВАРТА</b>");
    expect(message).toContain("<b>Имя:</b> Аня");
    expect(message).toContain("<b>Телефон:</b> <code>+375291234567</code>");
    expect(message).toContain("<b>Интерес:</b> Подписка");
    expect(message).toContain("<b>Комментарий:</b> Позвонить после обжарки");
    expect(message).toContain("15:00");
    expect(message).toContain("(Минск)");
  });

  it("escapes hostile user text instead of rendering markup", () => {
    const message = formatLeadMessage({
      ...lead,
      name: "<b>evil</b>",
      comment: '<img src=x onerror="x"> & more',
    });
    expect(message).not.toContain("<b>evil</b>");
    expect(message).toContain("<b>Имя:</b> &lt;b&gt;evil&lt;/b&gt;");
    expect(message).not.toContain("<img src");
    expect(message).toContain("&lt;img src=x");
    expect(message).toContain("&amp; more");
  });

  it("omits the comment line when the comment is empty or absent", () => {
    expect(formatLeadMessage({ ...lead, comment: "" })).not.toContain("Комментарий");
    expect(formatLeadMessage({ ...lead, comment: null })).not.toContain("Комментарий");
    expect(formatLeadMessage({ ...lead, comment: "   " })).not.toContain("Комментарий");
  });

  it("truncates long comments and stays under the Telegram message limit", () => {
    const longComment = "ы".repeat(1600);
    const message = formatLeadMessage({ ...lead, comment: longComment });
    expect(message).toContain(`${"ы".repeat(1500)}…`);
    expect(message).not.toContain(longComment);
    expect(message.length).toBeLessThan(4096);
  });
});

describe("sendLeadNotification", () => {
  it("posts the formatted HTML message to the configured chat", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await sendLeadNotification(lead);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) {
      throw new Error("expected a fetch call");
    }
    const [url, init] = firstCall;
    expect(String(url)).toContain("/bottest-token/sendMessage");
    expect(init?.method).toBe("POST");

    const rawBody = typeof init?.body === "string" ? init.body : "";
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    expect(body.chat_id).toBe("-10012345");
    expect(body.parse_mode).toBe("HTML");
    expect(String(body.text)).toContain("Новая заявка");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("logs HTTP errors without throwing", async () => {
    fetchMock.mockResolvedValue(new Response("bad request", { status: 400 }));

    await expect(sendLeadNotification(lead)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith("Telegram notification failed: HTTP 400");
  });

  it("aborts the request at the timeout and logs without throwing", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );

    const pending = sendLeadNotification(lead);
    await vi.advanceTimersByTimeAsync(5100);
    await expect(pending).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      "Telegram notification failed:",
      expect.stringContaining("abort"),
    );
  });

  it("skips with a warning when configuration is missing or partial", async () => {
    vi.mocked(getServerEnv).mockReturnValue({
      DATABASE_URL: "postgresql://test",
      ADMIN_PASSWORD: "test-password",
      TELEGRAM_CHAT_ID: "-10012345",
    });
    await sendLeadNotification(lead);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("not configured"));

    vi.mocked(getServerEnv).mockReturnValue({
      DATABASE_URL: "postgresql://test",
      ADMIN_PASSWORD: "test-password",
    });
    await sendLeadNotification(lead);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stays silent for reserved automated-test phones", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await sendLeadNotification({ ...lead, phone: "+375290000000" });
    await sendLeadNotification({ ...lead, phone: "+375294445566" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swallows unexpected fetch rejections", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(sendLeadNotification(lead)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith("Telegram notification failed:", "fetch failed");
  });
});

