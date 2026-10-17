"use client";

import { track } from "@vercel/analytics/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, type BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { submitLead, type LeadPayload, type SubmitLeadResult } from "@/actions/lead";
import { requestForm } from "@/content/landing";
import {
  INTEREST_OPTIONS,
  formatPhoneInput,
  leadSchema,
  type LeadFormValues,
} from "@/lib/schemas/lead";

const GENERIC_FAILURE = "Не удалось отправить заявку. Попробуйте ещё раз.";

export function RequestForm() {
  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", phone: "", comment: "" },
    mode: "onBlur",
  });

  const onSubmit = (values: LeadFormValues, event?: BaseSyntheticEvent) => {
    const formElement = event?.currentTarget as HTMLFormElement | undefined;
    const honeypotField = formElement?.elements.namedItem("website");
    const website = honeypotField instanceof HTMLInputElement ? honeypotField.value : "";

    const payload: LeadPayload = { ...values, website };
    setSubmissionError(null);

    startTransition(async () => {
      try {
        const result: SubmitLeadResult = await submitLead(payload);

        if (result.status === "ok") {
          setSuccess(true);
          track("lead-submitted");
          return;
        }

        if (result.status === "invalid") {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof LeadFormValues, { type: "server", message });
          }
          return;
        }

        setSubmissionError(result.message);
      } catch {
        setSubmissionError(GENERIC_FAILURE);
      }
    });
  };

  if (success) {
    return (
      <div role="status" className="alert alert-success items-start text-start">
        <div>
          <p className="font-heading text-3xl">{requestForm.successTitle}</p>
          <p className="mt-2 font-body">{requestForm.successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="lead-name" className="label px-0 py-0">
          <span className="label-text text-sm font-medium">
            Имя <span aria-hidden="true" className="text-error">*</span>
          </span>
        </label>
        <input
          id="lead-name"
          type="text"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          className={`input w-full font-body${errors.name ? " input-error" : ""}`}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
          {...control.register("name")}
        />
        {errors.name ? (
          <p id="lead-name-error" role="alert" className="label px-0">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="lead-phone" className="label px-0 py-0">
          <span className="label-text text-sm font-medium">
            Телефон <span aria-hidden="true" className="text-error">*</span>
          </span>
        </label>
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <div>
              <input
                id="lead-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+375 (29) 123-45-67"
                className={`input w-full font-body${fieldState.error ? " input-error" : ""}`}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? "lead-phone-error" : undefined}
              />
              {fieldState.error ? (
                <p id="lead-phone-error" role="alert" className="label px-0">
                  <span className="label-text-alt text-error">{fieldState.error.message}</span>
                </p>
              ) : null}
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name="interest"
        render={({ field, fieldState }) => (
          <fieldset className="fieldset px-0">
            <legend className="fieldset-legend px-0 py-0 mb-1">
              <span className="label-text text-sm font-medium label">
                Что вас интересует?{" "}
                <span aria-hidden="true" className="text-error">*</span>
              </span>
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6 text-sm">
              {INTEREST_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="label cursor-pointer justify-start gap-2 font-caption"
                >
                  <input
                    type="radio"
                    name="interest"
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                    onBlur={field.onBlur}
                    className="radio radio-primary"
                  />
                  <span className="label-text">{option.label}</span>
                </label>
              ))}
            </div>
            {fieldState.error ? (
              <p role="alert" className="fieldset-label text-error">
                {fieldState.error.message}
              </p>
            ) : null}
          </fieldset>
        )}
      />

      <div>
        <label htmlFor="lead-comment" className="label px-0 py-0">
          <span className="label-text text-sm font-medium">Комментарий</span>
        </label>
        <Controller
          control={control}
          name="comment"
          render={({ field, fieldState }) => (
            <div>
              <textarea
                id="lead-comment"
                placeholder="Например: интересует подписка, звоните после 18:00"
                rows={3}
                className={`textarea w-full font-body${fieldState.error ? " textarea-error" : ""}`}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? "lead-comment-error" : undefined}
              />
              {fieldState.error ? (
                <p id="lead-comment-error" role="alert" className="label px-0">
                  <span className="label-text-alt text-error">{fieldState.error.message}</span>
                </p>
              ) : null}
            </div>
          )}
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="lead-website">Не заполняйте это поле</label>
        <input
          id="lead-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {submissionError ? (
        <div role="alert" className="alert alert-error items-start text-start">
          <div>
            <p className="font-heading text-lg">{requestForm.errorTitle}</p>
            <p className="mt-1 font-caption text-sm">{submissionError}</p>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full px-6 text-base sm:w-auto"
      >
        {isPending ? "Отправляем…" : requestForm.submitLabel}
      </button>
    </form>
  );
}
