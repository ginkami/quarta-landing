import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssortmentCarousel } from "./AssortmentCarousel";

const REGION_NAME = "Ассортимент кофе";

// jsdom does not implement PointerEvent — provide the minimal surface the
// carousel handlers rely on (button, clientX, pointerType, pointerId).
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

describe("AssortmentCarousel", () => {
  const scrollByMock = vi.fn();

  beforeEach(() => {
    scrollByMock.mockReset();
    // jsdom has no smooth scrolling — stub it to assert the call arguments.
    Object.defineProperty(Element.prototype, "scrollBy", {
      configurable: true,
      writable: true,
      value: scrollByMock,
    });
  });

  function fakeGeometry(
    container: HTMLElement,
    geometry: { scrollWidth: number; clientWidth: number; scrollLeft: number },
  ) {
    Object.defineProperty(container, "scrollWidth", {
      configurable: true,
      value: geometry.scrollWidth,
    });
    Object.defineProperty(container, "clientWidth", {
      configurable: true,
      value: geometry.clientWidth,
    });
    Object.defineProperty(container, "scrollLeft", {
      configurable: true,
      writable: true,
      value: geometry.scrollLeft,
    });
    fireEvent.scroll(container);
  }

  function fakeCardOffsets(container: HTMLElement) {
    const items = container.querySelectorAll<HTMLElement>("[data-carousel-item]");
    const first = items[0];
    const second = items[1];
    if (!first || !second) {
      throw new Error("expected at least two carousel items");
    }
    Object.defineProperty(first, "offsetLeft", { configurable: true, value: 0 });
    Object.defineProperty(second, "offsetLeft", { configurable: true, value: 320 });
  }

  it("exposes the labelled region, four slides and both controls", () => {
    render(<AssortmentCarousel />);

    expect(screen.getByRole("region", { name: REGION_NAME })).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Предыдущий товар" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Следующий товар" })).toBeInTheDocument();
  });

  it("scrolls smoothly by one card step in both directions", () => {
    render(<AssortmentCarousel />);
    const container = screen.getByRole("region", { name: REGION_NAME });
    fakeCardOffsets(container);
    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Следующий товар" }));
    expect(scrollByMock).toHaveBeenLastCalledWith({ left: 320, behavior: "smooth" });

    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 600 });
    fireEvent.click(screen.getByRole("button", { name: "Предыдущий товар" }));
    expect(scrollByMock).toHaveBeenLastCalledWith({ left: -320, behavior: "smooth" });
  });

  it("pages with arrow keys on the focused region", () => {
    render(<AssortmentCarousel />);
    const container = screen.getByRole("region", { name: REGION_NAME });
    fakeCardOffsets(container);
    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 0 });

    fireEvent.keyDown(container, { key: "ArrowRight" });
    expect(scrollByMock).toHaveBeenLastCalledWith({ left: 320, behavior: "smooth" });

    fireEvent.keyDown(container, { key: "ArrowLeft" });
    expect(scrollByMock).toHaveBeenLastCalledWith({ left: -320, behavior: "smooth" });
  });

  it("disables the control that cannot scroll further", () => {
    render(<AssortmentCarousel />);
    const container = screen.getByRole("region", { name: REGION_NAME });
    const previous = screen.getByRole("button", { name: "Предыдущий товар" });
    const next = screen.getByRole("button", { name: "Следующий товар" });

    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 0 });
    expect(previous).toBeDisabled();
    expect(next).not.toBeDisabled();

    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 600 });
    expect(previous).not.toBeDisabled();
    expect(next).toBeDisabled();
  });

  it("drags with the mouse and stops tracking after release", () => {
    render(<AssortmentCarousel />);
    const container = screen.getByRole("region", { name: REGION_NAME });
    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 0 });

    fireEvent.pointerDown(container, {
      button: 0,
      pointerType: "mouse",
      clientX: 500,
      pointerId: 1,
    });
    fireEvent.pointerMove(container, { clientX: 300, pointerId: 1 });

    // Cursor moved 200px left → content scrolled 200px right, without easing.
    expect(container.scrollLeft).toBe(200);
    expect(container.style.scrollBehavior).toBe("auto");

    fireEvent.pointerUp(container, { pointerId: 1 });
    expect(container.style.scrollBehavior).toBe("");

    fireEvent.pointerMove(container, { clientX: 100, pointerId: 1 });
    expect(container.scrollLeft).toBe(200);
  });

  it("leaves touch pointers to native scrolling", () => {
    render(<AssortmentCarousel />);
    const container = screen.getByRole("region", { name: REGION_NAME });
    fakeGeometry(container, { scrollWidth: 1000, clientWidth: 400, scrollLeft: 40 });

    fireEvent.pointerDown(container, {
      button: 0,
      pointerType: "touch",
      clientX: 500,
      pointerId: 2,
    });
    fireEvent.pointerMove(container, { clientX: 200, pointerId: 2 });

    expect(container.scrollLeft).toBe(40);
    expect(container.style.scrollBehavior).toBe("");
  });

  it("keeps the controls centered in the section", () => {
    render(<AssortmentCarousel />);
    const next = screen.getByRole("button", { name: "Следующий товар" });
    expect(next.parentElement?.className).toContain("justify-center");
  });
});
