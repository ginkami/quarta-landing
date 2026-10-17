import { MapPinIcon, TruckIcon } from "lucide-react";
import { renderBynText } from "@/components/ui/BynIcon";
import { contacts, delivery, sections } from "@/content/landing";

export function Delivery() {
  return (
    <section id={sections.delivery} className="scroll-mt-20 bg-block/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
          Как получить заказ
        </p>
        <h2 className="font-heading mt-3 text-4xl md:text-5xl">Доставка и самовывоз</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-line bg-background p-6">
            <TruckIcon aria-hidden="true" className="size-8 text-primary" />
            <h3 className="font-heading mt-4 text-2xl">Доставка по Минску</h3>
            <ul className="mt-4 space-y-2 font-body">
              <li>{delivery.day}</li>
              <li>
                <span className="font-price text-lg font-semibold text-primary">
                  {renderBynText(delivery.priceLabel)}
                </span>
              </li>
              <li className="text-muted-foreground">{renderBynText(delivery.freeFromLabel)}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-background p-6">
            <MapPinIcon aria-hidden="true" className="size-8 text-primary" />
            <h3 className="font-heading mt-4 text-2xl">Самовывоз</h3>
            <p className="mt-4 font-body">{contacts.address}</p>
            <dl className="mt-3 space-y-1 font-caption text-sm text-muted-foreground">
              {contacts.hours.map((row) => (
                <div key={row.days} className="flex justify-between gap-4">
                  <dt>{row.days}</dt>
                  <dd className="font-price">{row.time}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <p className="mt-8 inline-block rounded-full bg-primary px-5 py-2.5 font-caption text-sm text-primary-foreground">
          {delivery.rhythm}
        </p>
      </div>
    </section>
  );
}
