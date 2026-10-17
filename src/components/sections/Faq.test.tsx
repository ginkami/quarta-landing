import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq } from "./Faq";

describe("FAQ accordion", () => {
  it("keeps the group single-open and reveals answers through radio state", () => {
    render(<Faq />);

    const firstRadio = screen.getByRole("radio", { name: /Насколько свежий кофе/i });
    const secondRadio = screen.getByRole("radio", { name: /Как работает доставка\?/i });

    // The first question is open by default; answers live in the DOM and are
    // shown/hidden by CSS based on the checked radio.
    expect(firstRadio).toBeChecked();
    expect(
      screen.getByText(/обжариваем партиями по 5 кг по четвергам/i),
    ).toBeInTheDocument();

    fireEvent.click(secondRadio);

    expect(secondRadio).toBeChecked();
    expect(firstRadio).not.toBeChecked();
    // The answer text is split around BYN icons — match the trailing fragment.
    expect(
      screen.getByText(/Заказ можно забрать самовывозом с ул\. Короля, 9\./),
    ).toBeInTheDocument();
  });

  it("renders a radio control labelled with each question", () => {
    render(<Faq />);

    const labels = [
      "Насколько свежий кофе?",
      "Как работает доставка?",
      "Что входит в подписку?",
      "Как оплатить заказ?",
      "Когда можно забрать заказ самовывозом?",
    ];
    for (const label of labels) {
      expect(screen.getByRole("radio", { name: label })).toBeInTheDocument();
    }
  });
});
