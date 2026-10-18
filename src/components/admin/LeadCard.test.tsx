import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteLead, saveComment, setLeadProcessed } from "@/actions/admin";
import type { AdminLead } from "@/lib/leads-admin";
import { LeadCard } from "./LeadCard";

vi.mock("@/actions/admin", () => ({
  adminLogin: vi.fn(),
  adminLogout: vi.fn(),
  verifyAdmin: vi.fn(),
  loadLeads: vi.fn(),
  setLeadProcessed: vi.fn(),
  deleteLead: vi.fn(),
  saveComment: vi.fn(),
}));

const lead: AdminLead = {
  id: "3f6a2f6e-1f2b-4c9d-8a1b-9d8c7e6f5a4b",
  createdAt: "2026-10-18T10:00:00.000Z",
  name: "Аня",
  phone: "+375291234567",
  interest: "Подписка",
  comment: "Позвонить после обжарки",
  processed: false,
  attribution: {
    first_touch: { utm_source: "instagram" },
    last_touch: {},
    submission_page: "/request",
  },
};

const onChanged = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LeadCard", () => {
  it("renders lead data with a tel link and the full comment", () => {
    render(<LeadCard lead={lead} onChanged={onChanged} />);
    expect(screen.getByRole("heading", { name: "Аня" })).toBeInTheDocument();
    const phone = screen.getByRole("link", { name: "+375291234567" });
    expect(phone).toHaveAttribute("href", "tel:+375291234567");
    expect(screen.getByText("Позвонить после обжарки")).toBeInTheDocument();
    expect(screen.getByText("нет данных")).toBeInTheDocument();
  });

  it("toggles the status optimistically and keeps it on success", async () => {
    vi.mocked(setLeadProcessed).mockResolvedValue({ status: "ok", found: true });
    render(<LeadCard lead={lead} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() =>
      expect(setLeadProcessed).toHaveBeenCalledWith(lead.id, true),
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reverts the toggle and shows an error when persistence fails", async () => {
    vi.mocked(setLeadProcessed).mockResolvedValue({ status: "error" });
    render(<LeadCard lead={lead} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось сохранить статус.");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("deletes only after confirmation", async () => {
    vi.mocked(deleteLead).mockResolvedValue({ status: "ok", found: true });
    render(<LeadCard lead={lead} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
    expect(screen.getByRole("dialog", { name: "Удалить заявку" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteLead).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
    fireEvent.click(screen.getByRole("button", { name: "Удалить заявку" }));
    await waitFor(() => expect(deleteLead).toHaveBeenCalledWith(lead.id));
    expect(onChanged).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("saves an edited comment from the modal", async () => {
    vi.mocked(saveComment).mockResolvedValue({ status: "ok", found: true });
    render(<LeadCard lead={lead} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("button", { name: "Редактировать комментарий" }));
    fireEvent.change(screen.getByLabelText("Комментарий"), {
      target: { value: "свежий контакт" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Принять" }));

    await waitFor(() =>
      expect(saveComment).toHaveBeenCalledWith(lead.id, "свежий контакт"),
    );
    expect(onChanged).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("clears the comment with «Удалить комментарий»", async () => {
    vi.mocked(saveComment).mockResolvedValue({ status: "ok", found: true });
    render(<LeadCard lead={lead} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("button", { name: "Редактировать комментарий" }));
    fireEvent.click(screen.getByRole("button", { name: "Удалить комментарий" }));

    await waitFor(() => expect(saveComment).toHaveBeenCalledWith(lead.id, null));
    expect(onChanged).toHaveBeenCalledTimes(1);
  });
});
