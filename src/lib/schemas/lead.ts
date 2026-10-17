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

const PHONE_PATTERN = /^\+375(17|25|29|33|44)\d{7}$/;

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
 * Progressive display mask for the phone field: keeps the input anchored to
 * `+375 (XX) XXX-XX-XX` while allowing partial values during typing.
 * Validation still decides acceptance; the mask never rejects keystrokes.
 */
export function formatPhoneInput(raw: string): string {
  const keepPlus = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  const matchedCountry = digits.startsWith("375");
  const national = (matchedCountry ? digits.slice(3) : digits).slice(0, 9);

  if (national === "") {
    return keepPlus ? "+" : "";
  }

  let formatted = `+375 (${national.slice(0, 2)}`;
  if (national.length >= 2) {
    formatted += ")";
  }
  if (national.length > 2) {
    formatted += ` ${national.slice(2, 5)}`;
  }
  if (national.length > 5) {
    formatted += `-${national.slice(5, 7)}`;
  }
  if (national.length > 7) {
    formatted += `-${national.slice(7, 9)}`;
  }
  return formatted;
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
