"use client";

import { useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { deleteLead, saveComment, setLeadProcessed } from "@/actions/admin";
import type { AdminLead } from "@/lib/leads-admin";
import { interestLabel } from "@/lib/schemas/lead";
import { AttributionSummary } from "./AttributionSummary";
import { CommentModal } from "./CommentModal";

interface LeadCardProps {
  lead: AdminLead;
  onChanged: () => void;
}

export function LeadCard({ lead, onChanged }: LeadCardProps) {
  const [processed, setProcessed] = useState(lead.processed);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const formattedDate = new Date(lead.createdAt).toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  async function handleToggle(next: boolean) {
    const previous = processed;
    setProcessed(next);
    setError(null);
    const result = await setLeadProcessed(lead.id, next);
    if (result.status !== "ok") {
      setProcessed(previous);
      setError("Не удалось сохранить статус.");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteLead(lead.id);
    setDeleting(false);
    if (result.status !== "ok") {
      setError("Не удалось удалить заявку.");
      return;
    }
    setDeleteOpen(false);
    onChanged();
  }

  async function handleSaveComment(comment: string | null): Promise<boolean> {
    const result = await saveComment(lead.id, comment);
    if (result.status !== "ok") {
      setError("Не удалось сохранить комментарий.");
      return false;
    }
    setError(null);
    setCommentOpen(false);
    onChanged();
    return true;
  }

  return (
    <li className="rounded-2xl border border-base-300 bg-base-100 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-caption text-xs text-base-content/60">{formattedDate}</p>
          <h2 className="font-heading mt-1 text-xl">{lead.name}</h2>
          <a
            href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
            className="link-hover link font-mono text-sm"
          >
            {lead.phone}
          </a>
          <p className="mt-1 text-sm text-base-content/80">{interestLabel(lead.interest)}</p>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={processed}
            onChange={(event) => void handleToggle(event.target.checked)}
          />
          <span className="font-caption text-sm">
            {processed ? "Обработана" : "Не обработана"}
          </span>
        </label>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-caption text-xs font-semibold uppercase tracking-wider text-base-content/60">
            Комментарий
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-square btn-xs"
            onClick={() => setCommentOpen(true)}
            aria-label="Редактировать комментарий"
            title="Редактировать комментарий"
          >
            <SquarePenIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
        {lead.comment ? (
          <p className="mt-1 whitespace-pre-wrap text-sm">{lead.comment}</p>
        ) : (
          <p className="mt-1 text-sm text-base-content/50">Без комментария</p>
        )}
      </div>

      <AttributionSummary attribution={lead.attribution} />

      {error ? (
        <div role="alert" className="alert alert-error mt-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="btn btn-error btn-ghost btn-sm"
          onClick={() => setDeleteOpen(true)}
        >
          Удалить
        </button>
      </div>

      {deleteOpen ? (
        <div
          className="modal modal-open"
          role="dialog"
          aria-modal="true"
          aria-label="Удалить заявку"
        >
          <div className="modal-box max-w-sm">
            <h3 className="font-heading text-lg">Удалить заявку?</h3>
            <p className="mt-2 text-sm text-base-content/80">
              Заявка «{lead.name}» ({lead.phone}) будет удалена навсегда.
            </p>
            <div className="modal-action mt-4 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? "Удаляю…" : "Удалить заявку"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {commentOpen ? (
        <CommentModal
          initialComment={lead.comment}
          onSave={handleSaveComment}
          onClose={() => setCommentOpen(false)}
        />
      ) : null}
    </li>
  );
}
