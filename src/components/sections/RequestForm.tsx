"use client";

import { track } from "@vercel/analytics/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, type BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { submitLead, type LeadPayload, type SubmitLeadResult } from "@/actions/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
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

    const payload: LeadPayload = {
      ...values,
      website,
    };
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
      <div role="status" className="rounded-xl border border-primary/40 bg-primary/10 p-6">
        <p className="font-heading text-3xl text-primary">{requestForm.successTitle}</p>
        <p className="mt-2 font-body">{requestForm.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="lead-name">Имя</Label>
        <Input
          id="lead-name"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
          {...control.register("name")}
        />
        {errors.name ? (
          <p id="lead-name-error" role="alert" className="font-caption text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-phone">Телефон</Label>
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Input
                id="lead-phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+375 (29) 123-45-67"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? "lead-phone-error" : undefined}
              />
              {fieldState.error ? (
                <p id="lead-phone-error" role="alert" className="font-caption text-sm text-destructive">
                  {fieldState.error.message}
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
          <fieldset className="space-y-2">
            <legend className="text-sm leading-none font-medium">
              Что вас интересует?
              <span aria-hidden="true" className="ml-1 text-destructive">
                *
              </span>
            </legend>
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={(nextValue) => field.onChange(nextValue)}
              className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6"
              aria-invalid={fieldState.error ? true : undefined}
            >
              {INTEREST_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 font-caption text-base"
                >
                  <RadioGroupItem value={option.value} />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
            {fieldState.error ? (
              <p role="alert" className="font-caption text-sm text-destructive">
                {fieldState.error.message}
              </p>
            ) : null}
          </fieldset>
        )}
      />

      <div className="space-y-1.5">
        <Label htmlFor="lead-comment">Комментарий</Label>
        <Controller
          control={control}
          name="comment"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Textarea
                id="lead-comment"
                placeholder="Например: интересует подписка, звоните после 18:00"
                rows={3}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={fieldState.error ? "lead-comment-error" : undefined}
              />
              {fieldState.error ? (
                <p id="lead-comment-error" role="alert" className="font-caption text-sm text-destructive">
                  {fieldState.error.message}
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
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="font-heading text-lg">{requestForm.errorTitle}</p>
          <p className="mt-1 font-caption text-sm">{submissionError}</p>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="h-12 w-full px-6 text-base sm:w-auto">
        {isPending ? "Отправляем…" : requestForm.submitLabel}
      </Button>
    </form>
  );
}
