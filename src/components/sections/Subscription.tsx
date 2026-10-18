import Image from "next/image";
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

          <p className="mt-6 font-price text-4xl font-semibold text-[color-mix(in_oklch,var(--color-secondary)_70%,black)]">
            {renderBynText(subscription.priceLabel)}
          </p>

          <a
            href={`#${sections.request}`}
            className="btn btn-primary btn-lg mt-6"
          >
            Оформить подписку
          </a>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-3xl bg-base-300/60 p-6 md:gap-4 md:p-10">
          <Image
            src="/images/doypack-empty.webp"
            alt=""
            width={400}
            height={600}
            className="h-auto w-full min-w-0 max-w-[160px] object-contain sm:max-w-[220px]"
          />
          <span
            aria-hidden="true"
            className="font-heading shrink-0 text-5xl leading-none text-primary sm:text-6xl md:text-7xl"
          >
            +
          </span>
          <Image
            src="/images/doypack-empty.webp"
            alt=""
            width={400}
            height={600}
            className="h-auto w-full min-w-0 max-w-[160px] object-contain sm:max-w-[220px]"
          />
        </div>
      </div>
    </section>
  );
}
