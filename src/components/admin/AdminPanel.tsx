"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogout, loadLeads, type LoadLeadsResult } from "@/actions/admin";
import type { AdminLead } from "@/lib/leads-admin";
import type { StatusFilter } from "@/lib/schemas/admin";
import { LeadCard } from "./LeadCard";

const FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "unprocessed", label: "Необработанные" },
  { value: "processed", label: "Обработанные" },
];

export function AdminPanel() {
  const router = useRouter();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyResult = useCallback(
    (result: LoadLeadsResult) => {
      if (result.status === "unauthorized") {
        router.replace("/admin/login");
        return;
      }
      if (result.status !== "ok") {
        setError("Не удалось загрузить заявки. Попробуйте обновить.");
        setLoading(false);
        return;
      }
      setError(null);
      setLeads(result.leads);
      setLoading(false);
    },
    [router],
  );

  // All state updates stay behind async boundaries: the effect resolves the
  // promise before applying it, event handlers flip `loading` themselves.
  useEffect(() => {
    let active = true;
    void loadLeads(filter).then((result) => {
      if (active) {
        applyResult(result);
      }
    });
    return () => {
      active = false;
    };
  }, [filter, applyResult]);

  function handleFilterChange(next: StatusFilter) {
    setLoading(true);
    setFilter(next);
  }

  function handleRefresh() {
    setLoading(true);
    void loadLeads(filter).then(applyResult);
  }

  async function handleLogout() {
    await adminLogout();
    router.replace("/admin/login");
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl md:text-4xl">Заявки</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Обновляю…" : "Обновить"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void handleLogout()}>
            Выйти
          </button>
        </div>
      </header>

      <div role="radiogroup" aria-label="Фильтр по статусу" className="join mt-5">
        {FILTERS.map((option) => (
          <input
            key={option.value}
            type="radio"
            name="status-filter"
            aria-label={option.label}
            className="btn join-item btn-sm"
            checked={filter === option.value}
            onChange={() => handleFilterChange(option.value)}
          />
        ))}
      </div>

      {error ? (
        <div role="alert" className="alert alert-error mt-4 text-sm">
          {error}
        </div>
      ) : null}

      {loading && leads.length === 0 ? (
        <div role="status" className="mt-6 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
          <span className="sr-only">Загружаю заявки…</span>
        </div>
      ) : leads.length === 0 ? (
        <p className="mt-6 text-sm text-base-content/60">Заявок пока нет.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onChanged={handleRefresh} />
          ))}
        </ul>
      )}
    </section>
  );
}
