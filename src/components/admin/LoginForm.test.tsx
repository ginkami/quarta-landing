import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminLogin } from "@/actions/admin";
import { LoginForm } from "./LoginForm";

const { replaceMock, refreshMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

vi.mock("@/actions/admin", () => ({
  adminLogin: vi.fn(),
}));

function submitPassword(password: string) {
  fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Войти" }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("shows a Russian error for a wrong password without navigating", async () => {
    vi.mocked(adminLogin).mockResolvedValue({ status: "invalid" });
    render(<LoginForm />);
    submitPassword("wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent("Неверный пароль.");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows the rate-limit message when the server throttles", async () => {
    vi.mocked(adminLogin).mockResolvedValue({ status: "rate-limited" });
    render(<LoginForm />);
    submitPassword("any-password");

    expect(await screen.findByRole("alert")).toHaveTextContent("Слишком много попыток");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("navigates to the admin panel on success", async () => {
    vi.mocked(adminLogin).mockResolvedValue({ status: "ok" });
    render(<LoginForm />);
    submitPassword("correct-password");

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin"));
    expect(adminLogin).toHaveBeenCalledWith({ password: "correct-password" });
  });
});
