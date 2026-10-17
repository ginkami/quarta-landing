import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq } from "./Faq";

describe("FAQ accordion", () => {
  it("starts fully collapsed and each question toggles independently", () => {
    render(<Faq />);

    const items = document.querySelectorAll<HTMLDetailsElement>("details");
    expect(items).toHaveLength(5);
    for (const item of items) {
      expect(item.open).toBe(false);
    }

    const first = items[0];
    const second = items[1];
    if (!first || !second) {
      throw new Error("expected FAQ items");
    }
    const firstSummary = first.querySelector("summary");
    const secondSummary = second.querySelector("summary");
    if (!firstSummary || !secondSummary) {
      throw new Error("expected summaries");
    }

    fireEvent.click(firstSummary);
    expect(first.open).toBe(true);

    // Independent disclosure: opening another question keeps the first open.
    fireEvent.click(secondSummary);
    expect(second.open).toBe(true);
    expect(first.open).toBe(true);

    // Fully collapsible: the same question closes again.
    fireEvent.click(firstSummary);
    expect(first.open).toBe(false);
    expect(second.open).toBe(true);
  });

  it("renders questions as summaries and keeps answers with BYN icons inside", () => {
    render(<Faq />);

    expect(screen.getByText("Насколько свежий кофе?").closest("summary")).not.toBeNull();
    expect(screen.getByText("Как работает доставка?").closest("summary")).not.toBeNull();
    // Three BYN occurrences live inside the FAQ answers.
    expect(document.querySelectorAll("details .nbrb-icon")).toHaveLength(3);
  });
});
