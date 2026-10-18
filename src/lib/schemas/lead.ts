import { z } from "zod";

export const INTEREST_VALUES = ["subscription", "single_order", "question"] as const;

export type Interest = (typeof INTEREST_VALUES)[number];

export const INTEREST_OPTIONS: ReadonlyArray<{ value: Interest; label: string }> = [
  { value: "subscription", label: "Подписка" },
  { value: "single_order", label: "Разовый заказ" },
  { value: "question", label: "Вопрос" },
];

const PHONE_FORMAT_MESSAGE =
  "Номер должен начинаться с +375 и содержать 12 цифр: +375 (29) 123-45-67";

const PHONE_PATTERN = /^\+375\d{9}$/;

/**
 * Strips presentation characters (spaces, parentheses, dashes) so the
 * stored value always matches `+375XXXXXXXXX`. Only use after validation:
 * the input must already satisfy {@link PHONE_PATTERN}.
 */
export function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(value));
}

/**
 * Formats a complete valid number for display (`+375 (XX) XXX-XX-XX`) on blur.
 * Partial or invalid input passes through untouched — keystrokes never rewrite
 * the value, so the caret never jumps. Validation still decides acceptance;
 * this is presentation only.
 */
export function formatPhoneInput(raw: string): string {
  const match = /^\+375(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(normalizePhone(raw));
  if (!match) {
    return raw;
  }
  const [, area, subscriber, localFirst, localLast] = match;
  if (!area || !subscriber || !localFirst || !localLast) {
    return raw;
  }
  return `+375 (${area}) ${subscriber}-${localFirst}-${localLast}`;
}

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя (минимум 2 символа)")
    .max(100, "Имя слишком длинное (максимум 100 символов)"),
  phone: z
    .string()
    .trim()
    .min(1, "Укажите номер телефона")
    .refine(isValidPhone, PHONE_FORMAT_MESSAGE)
    .transform(normalizePhone),
  interest: z.enum(INTEREST_VALUES, {
    errorMap: () => ({ message: "Выберите, что вас интересует" }),
  }),
  comment: z
    .string()
    .trim()
    .max(500, "Комментарий слишком длинный (максимум 500 символов)")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

/** Values as entered by the visitor (react-hook-form shape). */
export type LeadFormValues = z.input<typeof leadSchema>;

/** Validated and normalized values as stored on a lead. */
export type LeadInput = z.output<typeof leadSchema>;
