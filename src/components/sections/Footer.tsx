import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { brand, contacts, footerContactsId, footerNavItems } from "@/content/landing";

function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TelegramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-base-100/15 bg-base-content text-base-100">
      <div className="footer mx-auto max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-3">
        {/* Brand column */}
        <div>
          <p className="font-heading text-2xl leading-none">{brand.name}</p>
          <p className="mt-1 font-caption text-sm text-base-100/70">
            {brand.tagline}
          </p>
          <p className="mt-4 font-caption text-xs text-base-100/60">
            © 2019–2026 {brand.name} · Все права защищены
          </p>
        </div>

        {/* Duplicate of the header navigation — large screens only */}
        <nav aria-label="Навигация в подвале" className="hidden md:block">
          <ul className="flex flex-col gap-2">
            {footerNavItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="link-hover link font-caption text-sm"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contacts as a single vertical list with icon markers */}
        <ul
          id={footerContactsId}
          className="flex flex-col gap-3 scroll-mt-16 font-caption text-sm text-base-100"
        >
          <li className="font-caption text-sm uppercase tracking-[0.25em] text-base-100/70">
            Контакты
          </li>
          <li className="flex items-center gap-3">
            <PhoneIcon aria-hidden="true" className="size-5 shrink-0 text-base-100" />
            <a
              href={`tel:${contacts.phoneHref}`}
              className="link-hover link font-mono"
            >
              {contacts.phone}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <MailIcon aria-hidden="true" className="size-5 shrink-0 text-base-100" />
            <a href={`mailto:${contacts.email}`} className="link-hover link">
              {contacts.email}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <MapPinIcon aria-hidden="true" className="size-5 shrink-0 text-base-100" />
            <span>{contacts.address}</span>
          </li>
          <li className="flex items-center gap-3">
            <ClockIcon aria-hidden="true" className="size-5 shrink-0 text-base-100" />
            <span className="font-mono">{contacts.hours.map((row) => `${row.days} ${row.time}`).join(" · ")}</span>
          </li>
          <li className="flex items-center gap-1 pt-1 ml-[-0.3rem]">
            <a
              href={contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="btn btn-ghost btn-circle btn-sm text-base-100 hover:bg-base-100/15"
            >
              <InstagramGlyph />
            </a>
            <a
              href={contacts.telegramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="btn btn-ghost btn-circle btn-sm text-base-100 hover:bg-base-100/15"
            >
              <TelegramGlyph />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
