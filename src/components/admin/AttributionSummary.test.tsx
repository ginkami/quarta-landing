import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttributionSummary } from "./AttributionSummary";

const campaignAttribution = {
  first_touch: { utm_source: "instagram", referrer: "https://instagram.com/quarta-roast" },
  last_touch: {},
  submission_page: "/request",
};

describe("AttributionSummary", () => {
  it("renders chips, rows, submission page and raw JSON", () => {
    render(<AttributionSummary attribution={campaignAttribution} />);

    expect(screen.getByText("Первый визит")).toBeInTheDocument();
    expect(screen.getByText("Последний визит")).toBeInTheDocument();
    expect(screen.getByTitle("utm_source=instagram")).toBeInTheDocument();
    expect(screen.getByTitle("https://instagram.com/quarta-roast")).toBeInTheDocument();
    expect(screen.getByText("нет данных")).toBeInTheDocument();
    expect(screen.getByText(/Страница отправки: \/request/)).toBeInTheDocument();
    expect(screen.getByText(/"first_touch"/)).toBeInTheDocument();
  });

  it("shows «нет данных» for both touches on empty attribution", () => {
    render(<AttributionSummary attribution={{}} />);
    expect(screen.getAllByText("нет данных")).toHaveLength(2);
    expect(screen.queryByText(/Страница отправки/)).not.toBeInTheDocument();
  });

  it("expands the source block on summary activation", () => {
    render(<AttributionSummary attribution={campaignAttribution} />);
    const details = screen.getByText("Источник").closest("details");
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
    fireEvent.click(screen.getByText("Источник"));
    expect(details?.open).toBe(true);
  });

  it("handles non-object attribution defensively", () => {
    render(<AttributionSummary attribution={undefined} />);
    expect(screen.getAllByText("нет данных")).toHaveLength(2);
  });
});
