import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BynIcon, renderBynText } from "./BynIcon";

describe("BynIcon", () => {
  it("renders the official NBRB markup with readable text", () => {
    const { container } = render(<BynIcon />);
    const icon = container.querySelector("i.nbrb-icon");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("BYN");
  });
});

describe("renderBynText", () => {
  it("wraps a single occurrence without altering the string", () => {
    const { container } = render(<span>{renderBynText("54 BYN / мес")}</span>);
    expect(container.querySelectorAll("i.nbrb-icon")).toHaveLength(1);
    expect(container.textContent).toBe("54 BYN / мес");
  });

  it("wraps every occurrence in a multi-price string", () => {
    const { container } = render(
      <p>{renderBynText("По Минску возим по пятницам — 5 BYN, от 50 BYN бесплатно.")}</p>,
    );
    expect(container.querySelectorAll("i.nbrb-icon")).toHaveLength(2);
    expect(container.textContent).toBe(
      "По Минску возим по пятницам — 5 BYN, от 50 BYN бесплатно.",
    );
  });

  it("leaves text without BYN untouched", () => {
    const { container } = render(
      <p>{renderBynText("Обжариваем партиями по 5 кг")}</p>,
    );
    expect(container.querySelectorAll("i.nbrb-icon")).toHaveLength(0);
    expect(container.textContent).toBe("Обжариваем партиями по 5 кг");
  });
});
