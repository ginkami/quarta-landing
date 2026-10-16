import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq } from "./Faq";

describe("FAQ accordion", () => {
  it("reveals the answer when a question is activated", () => {
    render(<Faq />);

    const trigger = screen.getByRole("button", { name: /Насколько свежий кофе/i });
    expect(
      screen.queryByText(/обжариваем партиями по 5 кг по четвергам/i),
    ).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(
      screen.getByText(/обжариваем партиями по 5 кг по четвергам/i),
    ).toBeInTheDocument();
  });
});
