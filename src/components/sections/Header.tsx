"use client";

import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hero, navItems, sections } from "@/content/landing";

const requestEntry = `#${sections.contacts}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header id="top" className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <a
          href="#top"
          onClick={close}
          className="font-heading text-3xl leading-none tracking-wide text-foreground"
        >
          КВАРТА
        </a>

        <nav aria-label="Разделы" className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-caption text-sm text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<a href={requestEntry} />}
            className="hidden h-10 px-4 sm:inline-flex"
          >
            {hero.cta}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Разделы (мобильное меню)"
          className="border-t border-line bg-background md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={close}
                className="rounded-lg px-2 py-2.5 font-caption text-base text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
            <a
              href={requestEntry}
              onClick={close}
              className="mt-2 rounded-lg bg-primary px-2 py-3 text-center font-caption text-base font-medium text-primary-foreground"
            >
              {hero.cta}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
