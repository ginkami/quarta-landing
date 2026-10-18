import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentModal } from "./CommentModal";

describe("CommentModal", () => {
  it("shows the full initial comment in the textarea", () => {
    render(
      <CommentModal initialComment="старый комментарий" onSave={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByLabelText("Комментарий")).toHaveValue("старый комментарий");
  });

  it("saves the edited text on «Принять»", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(<CommentModal initialComment="старый" onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText("Комментарий"), {
      target: { value: "свежий контакт" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Принять" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("свежий контакт"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes without saving on «Отмена»", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<CommentModal initialComment="старый" onSave={onSave} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("clears the comment with «Удалить комментарий»", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<CommentModal initialComment="старый" onSave={onSave} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Удалить комментарий" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(null));
  });

  it("disables the clear button when there is no text", () => {
    render(<CommentModal initialComment={null} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Удалить комментарий" })).toBeDisabled();
  });
});
