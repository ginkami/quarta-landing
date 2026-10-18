import { getServerEnv } from "@/lib/env";
import { INTEREST_OPTIONS } from "@/lib/schemas/lead";

/** Data needed to render the group notification. */
export interface LeadNotificationData {
  readonly name: string;
  readonly phone: string;
  /** Raw interest value from the lead schema (`subscription`/…). */
  readonly interest: string;
  readonly comment?: string | null;
  readonly createdAt?: Date;
}

const TELEGRAM_TIMEOUT_MS = 5000;
const COMMENT_MAX_LENGTH = 1500;

/**
 * Phones used by automated smokes — suppressed before any network call so
 * scheduled test runs never spam the group chat.
 */
const SUPPRESSED_TEST_PHONES: readonly string[] = ["+375290000000", "+375294445566"];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function interestLabel(value: string): string {
  return INTEREST_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** Renders the approved Telegram HTML message for a lead (pure, escaping all user text). */
export function formatLeadMessage(lead: LeadNotificationData): string {
  const time = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(lead.createdAt ?? new Date());

  const lines = [
    "☕ <b>Новая заявка — КВАРТА</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> <code>${escapeHtml(lead.phone)}</code>`,
    `<b>Интерес:</b> ${escapeHtml(interestLabel(lead.interest))}`,
  ];

  const comment = lead.comment?.trim();
  if (comment) {
    const truncated =
      comment.length > COMMENT_MAX_LENGTH ? `${comment.slice(0, COMMENT_MAX_LENGTH)}…` : comment;
    lines.push(`<b>Комментарий:</b> ${escapeHtml(truncated)}`);
  }

  lines.push("", `<i>${time} (Минск)</i>`);
  return lines.join("\n");
}

/**
 * Best-effort Telegram send: never throws, never changes the lead's outcome.
 * Every failure (missing config, HTTP error, timeout) is logged server-side.
 */
export async function sendLeadNotification(lead: LeadNotificationData): Promise<void> {
  try {
    if (SUPPRESSED_TEST_PHONES.includes(lead.phone)) {
      return;
    }

    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = getServerEnv();
    if (!token || !chatId) {
      console.warn(
        "Telegram notification skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured",
      );
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatLeadMessage(lead),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        console.error(`Telegram notification failed: HTTP ${response.status}`);
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (error: unknown) {
    console.error(
      "Telegram notification failed:",
      error instanceof Error ? error.message : String(error),
    );
  }
}
