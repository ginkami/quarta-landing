import { summarizeTouch, type TouchChip } from "@/lib/summarize-touch";

function asStringRecord(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      result[key] = entry;
    }
  }
  return result;
}

function TouchRow({ label, chips }: { label: string; chips: TouchChip[] }) {
  return (
    <div>
      <p className="font-caption text-xs font-semibold uppercase tracking-wider text-base-content/60">
        {label}
      </p>
      {chips.length === 0 ? (
        <p className="mt-1 text-sm text-base-content/50">нет данных</p>
      ) : (
        <div className="mt-1 flex flex-wrap gap-1">
          {chips.map((chip) => (
            <span
              key={`${chip.kind}:${chip.label}`}
              title={chip.title}
              className="badge badge-outline badge-sm font-caption"
            >
              <span className="block max-w-[12rem] truncate">{chip.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function AttributionSummary({ attribution }: { attribution: unknown }) {
  const root =
    typeof attribution === "object" && attribution !== null
      ? (attribution as Record<string, unknown>)
      : {};
  const first = asStringRecord(root.first_touch);
  const last = asStringRecord(root.last_touch);
  const submissionPage =
    typeof root.submission_page === "string" ? root.submission_page : undefined;

  return (
    <details className="mt-3 rounded-xl border border-base-300 bg-base-200/50 p-3">
      <summary className="cursor-pointer font-caption text-sm">Источник</summary>
      <div className="mt-3 space-y-3">
        <TouchRow label="Первый визит" chips={summarizeTouch(first)} />
        <TouchRow label="Последний визит" chips={summarizeTouch(last)} />
        {submissionPage ? (
          <p className="font-caption text-xs text-base-content/60">
            Страница отправки: {submissionPage}
          </p>
        ) : null}
        <details className="rounded-lg border border-base-300 bg-base-100 p-2">
          <summary className="cursor-pointer font-caption text-xs">JSON</summary>
          <pre className="mt-2 overflow-x-auto text-xs">
            {JSON.stringify(attribution, null, 2)}
          </pre>
        </details>
      </div>
    </details>
  );
}
