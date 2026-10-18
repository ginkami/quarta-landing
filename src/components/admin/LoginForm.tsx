"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/actions/admin";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const result = await adminLogin({ password: formData.get("password") });
    setPending(false);

    if (result.status === "ok") {
      router.replace("/admin");
      return;
    }
    setError(
      result.status === "rate-limited"
        ? "Слишком много попыток. Попробуйте позже."
        : "Неверный пароль.",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-2xl border border-base-300 bg-base-100 p-8"
    >
      <h1 className="font-heading text-3xl">Вход в админ-панель</h1>

      <div>
        <label htmlFor="admin-password" className="label">
          <span className="label-text text-sm font-medium">Пароль</span>
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input w-full"
        />
      </div>

      {error ? (
        <div role="alert" className="alert alert-error text-sm">
          {error}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
