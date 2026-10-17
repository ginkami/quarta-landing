import { CheckIcon } from "lucide-react";
import { renderBynText } from "@/components/ui/BynIcon";
import { sections, subscription } from "@/content/landing";

export function Subscription() {
  return (
    <section id={sections.subscription} className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <span className="badge badge-pill badge-secondary font-caption text-sm font-normal">
            {subscription.badge}
          </span>
          <h2 className="font-heading mt-4 text-4xl md:text-5xl">
            Подписка на свежий кофе
          </h2>
          <p className="mt-4 font-body text-lg text-base-content/70">
            Каждый месяц привозим свежую обжарку — самому думать о заказе не нужно.
          </p>

          <ul className="mt-6 space-y-3 font-body">
            <li className="flex items-start gap-3">
              <CheckIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
              {subscription.packs}
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
              {subscription.delivery}
            </li>
          </ul>

          <p className="mt-6 font-price text-4xl font-semibold text-primary">
            {renderBynText(subscription.priceLabel)}
          </p>

          <a
            href={`#${sections.request}`}
            className="btn btn-primary btn-lg mt-6"
          >
            Оформить подписку
          </a>
        </div>

        <div className="rounded-3xl bg-base-300/60 p-8 md:p-10">
          <p className="font-heading text-6xl leading-none text-base-content md:text-7xl">
            2 × 250 г
          </p>
          <p className="mt-4 font-caption text-lg text-base-content/80">
            пачки каждый месяц с бесплатной доставкой
          </p>
          <p className="mt-8 font-price text-3xl font-semibold text-primary">
            {renderBynText(subscription.priceLabel)}
          </p>
        </div>
      </div>
    </section>
  );
}
