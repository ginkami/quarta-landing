import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "@vercel/analytics/react";
import { submitLead } from "@/actions/lead";
import { RequestForm } from "./RequestForm";

vi.mock("@/actions/lead", () => ({
  submitLead: vi.fn(),
}));

vi.mock("@vercel/analytics/react", () => ({
  track: vi.fn(),
}));

const submitLeadMock = vi.mocked(submitLead);
const trackMock = vi.mocked(track);

function fillNameAndInterest(name: string, interest: string) {
  fireEvent.change(screen.getByLabelText(/^Имя/), { target: { value: name } });
  fireEvent.click(screen.getByRole("radio", { name: interest }));
}

describe("RequestForm", () => {
  beforeEach(() => {
    submitLeadMock.mockReset();
    trackMock.mockReset();
  });

  it("shows a Russian phone hint without invoking the action", async () => {
    render(<RequestForm />);

    fillNameAndInterest("Мария", "Подписка");
    fireEvent.change(screen.getByLabelText(/^Телефон/), { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));

    expect(
      await screen.findByText(/Номер должен начинаться с \+375/),
    ).toBeInTheDocument();
    expect(submitLeadMock).not.toHaveBeenCalled();
  });

  it("submits a valid lead, confirms success and emits one conversion event", async () => {
    submitLeadMock.mockResolvedValue({ status: "ok", duplicate: false });
    render(<RequestForm />);

    fillNameAndInterest("Мария", "Разовый заказ");
    fireEvent.change(screen.getByLabelText(/^Телефон/), {
      target: { value: "+375291234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));

    expect(await screen.findByText("Заявка принята!")).toBeInTheDocument();
    expect(submitLeadMock).toHaveBeenCalledTimes(1);
    expect(submitLeadMock).toHaveBeenCalledWith({
      name: "Мария",
      phone: "+375291234567",
      interest: "single_order",
      website: "",
    });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith("lead-submitted");
  });

  it("keeps the honeypot field hidden from visitors", () => {
    const { container } = render(<RequestForm />);
    const honeypot = container.querySelector("#lead-website");
    expect(honeypot).not.toBeNull();
    expect(honeypot?.closest("div")?.className).toContain("hidden");
  });

  it("passes raw digits through while typing and formats a valid number on blur", () => {
    render(<RequestForm />);
    const phone = screen.getByLabelText(/^Телефон/);

    fireEvent.change(phone, { target: { value: "+3" } });
    expect(phone).toHaveValue("+3");

    fireEvent.change(phone, { target: { value: "+375291234567" } });
    fireEvent.blur(phone);
    expect(phone).toHaveValue("+375 (29) 123-45-67");
  });
});
