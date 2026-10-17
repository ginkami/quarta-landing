"use client";

import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { hero, navItems, sections } from "@/content/landing";

const requestEntry = `#${sections.request}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header
      id="top"
      className="sticky top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur"
    >
      <div className="navbar mx-auto w-full max-w-6xl px-4">
        <div className="navbar-start">
        <a
          href="#top"
          onClick={close}
          className="font-heading text-3xl leading-none tracking-wide text-base-content"
        >
          КВАРТА
        </a>
      </div>

      <nav aria-label="Разделы" className="navbar-center hidden gap-5 lg:flex">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="font-caption text-sm text-base-content/80 transition-colors hover:text-primary"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="navbar-end gap-2">
        <a href={requestEntry} className="btn btn-primary hidden px-4 sm:inline-flex">
          {hero.cta}
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-circle lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Разделы (мобильное меню)"
          className="absolute inset-x-0 top-full border-t border-base-300 bg-base-100 lg:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={close}
                className="rounded-lg px-2 py-2.5 font-caption text-base text-base-content transition-colors hover:bg-base-200"
              >
                {item.label}
              </a>
            ))}
            <a href={requestEntry} onClick={close} className="btn btn-primary mt-2 w-full">
              {hero.cta}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
