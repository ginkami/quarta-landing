import { MapPinIcon, PhoneIcon } from "lucide-react";
import { contacts, sections } from "@/content/landing";

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
      className="size-6 shrink-0 text-primary"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Contacts() {
  return (
    <section id={sections.contacts} className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
          Оставьте заявку — перезвоним
        </p>
        <h2 className="font-heading mt-3 text-4xl md:text-5xl">Контакты</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="card border border-base-300 bg-base-100 p-6">
            <MapPinIcon aria-hidden="true" className="size-8 text-primary" />
            <h3 className="font-heading mt-4 text-2xl">Мастерская</h3>
            <p className="mt-3 font-body text-lg">{contacts.address}</p>
            <dl className="mt-4 space-y-1 font-caption text-sm text-base-content/70">
              {contacts.hours.map((row) => (
                <div key={row.days} className="flex justify-between gap-4">
                  <dt>{row.days}</dt>
                  <dd className="font-price">{row.time}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="card border border-base-300 bg-base-100 p-6">
            <h3 className="font-heading text-2xl">Связаться</h3>
            <a
              href={`tel:${contacts.phoneHref}`}
              className="link-hover link mt-4 flex items-center gap-3 font-price text-2xl font-semibold text-primary"
            >
              <PhoneIcon aria-hidden="true" className="size-6 shrink-0" />
              {contacts.phone}
            </a>
            <a
              href={contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="link-hover link mt-4 flex items-center gap-3 font-body text-lg text-base-content"
            >
              <InstagramGlyph />
              {contacts.instagramLabel}
            </a>
            <p className="mt-6 font-caption text-sm text-base-content/70">
              Позвоните или напишите — менеджер перезвонит и оформит заказ.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
