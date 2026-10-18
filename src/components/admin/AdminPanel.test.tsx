import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminLogout, loadLeads } from "@/actions/admin";
import type { AdminLead } from "@/lib/leads-admin";
import { AdminPanel } from "./AdminPanel";

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replaceMock = vi.fn();
  const refreshMock = vi.fn();
  return { replaceMock, refreshMock, routerMock: { replace: replaceMock, refresh: refreshMock } };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

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
  comment: null,
  processed: false,
  attribution: { first_touch: {}, last_touch: {} },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminPanel", () => {
  it("loads and renders leads on mount", async () => {
    vi.mocked(loadLeads).mockResolvedValue({ status: "ok", leads: [lead] });
    render(<AdminPanel />);

    expect(await screen.findByRole("heading", { name: "Аня" })).toBeInTheDocument();
    expect(loadLeads).toHaveBeenCalledWith("all");
  });

  it("redirects to the login page when unauthorized", async () => {
    vi.mocked(loadLeads).mockResolvedValue({ status: "unauthorized" });
    render(<AdminPanel />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/login"));
    expect(screen.queryByRole("heading", { name: "Аня" })).not.toBeInTheDocument();
  });

  it("reloads the list when the status filter changes", async () => {
    vi.mocked(loadLeads).mockResolvedValue({ status: "ok", leads: [lead] });
    render(<AdminPanel />);
    await screen.findByRole("heading", { name: "Аня" });

    fireEvent.click(screen.getByRole("radio", { name: "Обработанные" }));
    await waitFor(() => expect(loadLeads).toHaveBeenLastCalledWith("processed"));
  });

  it("refetches on the refresh button", async () => {
    vi.mocked(loadLeads).mockResolvedValue({ status: "ok", leads: [lead] });
    render(<AdminPanel />);
    await screen.findByRole("heading", { name: "Аня" });

    fireEvent.click(screen.getByRole("button", { name: "Обновить" }));
    await waitFor(() => expect(loadLeads).toHaveBeenCalledTimes(2));
  });

  it("logs out through the server action and returns to the login page", async () => {
    vi.mocked(loadLeads).mockResolvedValue({ status: "ok", leads: [] });
    vi.mocked(adminLogout).mockResolvedValue(undefined);
    render(<AdminPanel />);
    await screen.findByText("Заявок пока нет.");

    fireEvent.click(screen.getByRole("button", { name: "Выйти" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/login"));
    expect(adminLogout).toHaveBeenCalledTimes(1);
  });

  it("shows a Russian error when loading fails", async () => {
    vi.mocked(loadLeads).mockResolvedValue({ status: "error" });
    render(<AdminPanel />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось загрузить заявки");
  });
});
