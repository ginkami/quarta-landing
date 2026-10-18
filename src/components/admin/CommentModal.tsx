"use client";

import { useState } from "react";

interface CommentModalProps {
  initialComment: string | null;
  /** Resolves to true when the comment was persisted successfully. */
  onSave: (comment: string | null) => Promise<boolean>;
  onClose: () => void;
}

export function CommentModal({ initialComment, onSave, onClose }: CommentModalProps) {
  const [text, setText] = useState(initialComment ?? "");
  const [saving, setSaving] = useState(false);

  async function save(comment: string | null) {
    setSaving(true);
    await onSave(comment);
    setSaving(false);
  }

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-label="Редактирование комментария"
    >
      <div className="modal-box max-w-lg">
        <h3 className="font-heading text-lg">Комментарий к заявке</h3>
        <textarea
          className="textarea textarea-bordered mt-3 h-40 w-full"
          value={text}
          maxLength={2000}
          onChange={(event) => setText(event.target.value)}
          placeholder="Заметка для ростера"
          aria-label="Комментарий"
        />
        <div className="modal-action mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void save(text)}
            disabled={saving}
          >
            Принять
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Отмена
          </button>
          <button
            type="button"
            className="btn btn-outline btn-error"
            onClick={() => void save(null)}
            disabled={saving || text.length === 0}
          >
            Удалить комментарий
          </button>
        </div>
      </div>
    </div>
  );
}
