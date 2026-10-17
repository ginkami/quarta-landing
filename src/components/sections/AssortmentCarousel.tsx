"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { BynIcon } from "@/components/ui/BynIcon";
import { assortment } from "@/content/landing";

const SCROLL_TOLERANCE = 1;

export function AssortmentCarousel() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const updateEdgeState = useCallback(() => {
    const container = carouselRef.current;
    if (!container) {
      return;
    }
    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanPrev(container.scrollLeft > SCROLL_TOLERANCE);
    setCanNext(container.scrollLeft < maxScroll - SCROLL_TOLERANCE);
  }, []);

  useEffect(() => {
    updateEdgeState();
  }, [updateEdgeState]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const container = carouselRef.current;
    if (!container) {
      return;
    }
    const items = container.querySelectorAll<HTMLElement>("[data-carousel-item]");
    const first = items[0];
    const second = items[1];
    // Step equals the distance between two cards — includes the gap and
    // follows the responsive card widths (85% / 1/2 / 1/3).
    const step =
      first && second ? second.offsetLeft - first.offsetLeft : container.clientWidth;
    container.scrollBy({ left: step * direction, behavior: "smooth" });
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    }
  };

  /*
   * Mouse/pen drag-to-scroll. Touch pointers are intentionally skipped so
   * native momentum scrolling keeps working; scroll behavior switches to
   * "auto" while dragging so the content follows the cursor without lag.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.pointerType === "touch") {
      return;
    }
    const container = carouselRef.current;
    if (!container) {
      return;
    }
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = container.scrollLeft;
    setIsDragging(true);
    container.style.scrollBehavior = "auto";
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }
    const container = carouselRef.current;
    if (!container) {
      return;
    }
    const delta = event.clientX - dragStartXRef.current;
    container.scrollLeft = dragStartScrollLeftRef.current - delta;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    const container = carouselRef.current;
    if (container) {
      container.style.scrollBehavior = "";
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  return (
    <>
      <div
        ref={carouselRef}
        onScroll={updateEdgeState}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDragStart={(event) => event.preventDefault()}
        role="region"
        aria-roledescription="карусель"
        aria-label="Ассортимент кофе"
        tabIndex={0}
        className={`carousel carousel-center scroll-smooth mt-10 w-full gap-4 select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {assortment.map((product, index) => (
          <div
            key={product.id}
            id={`assortment-${index}`}
            role="group"
            aria-roledescription="слайд"
            aria-label={`${index + 1} из ${assortment.length}: ${product.title}`}
            data-carousel-item
            className="carousel-item w-[85%] sm:w-1/2 lg:w-2/7"
          >
            <article className="card w-full border border-base-300 bg-base-100 p-4">
              <figure>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={600}
                  height={900}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                  className="aspect-[2/3] w-full rounded-box object-cover"
                />
              </figure>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-heading text-2xl">{product.title}</h3>
                <p className="font-price whitespace-nowrap text-xl font-semibold text-primary">
                  {product.price} <BynIcon />
                </p>
              </div>
              <p className="mt-1 font-caption text-sm text-base-content/70">
                {product.description}
              </p>
            </article>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          className="btn btn-circle btn-outline"
          aria-label="Предыдущий товар"
          disabled={!canPrev}
          onClick={() => scrollByCard(-1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-circle btn-outline"
          aria-label="Следующий товар"
          disabled={!canNext}
          onClick={() => scrollByCard(1)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
