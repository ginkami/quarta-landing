import { z } from "zod";

/** Login form: a single password field. */
export const loginSchema = z.object({
  password: z.string().min(1, "Введите пароль"),
});

/** UUID of an existing lead. */
export const leadIdSchema = z.string().uuid("Некорректный идентификатор заявки");

/** Free-text comment attached to a lead; null clears it. */
export const commentSchema = z
  .string()
  .max(2000, "Комментарий слишком длинный")
  .nullable();

/** Status filter options for the admin list. */
export const statusFilterSchema = z.enum(["all", "unprocessed", "processed"]);

/** Target value of the processing-status toggle. */
export const processedSchema = z.boolean();

export type LoginInput = z.infer<typeof loginSchema>;
export type StatusFilter = z.infer<typeof statusFilterSchema>;
