import { assortmentLead, sections } from "@/content/landing";
import { AssortmentCarousel } from "./AssortmentCarousel";

export function Assortment() {
  return (
    <section
      id={sections.assortment}
      className="scroll-mt-20 bg-base-300/30 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
          Что обжариваем
        </p>
        <h2 className="font-heading mt-3 text-4xl md:text-5xl">Ассортимент</h2>
        <p className="mt-3 max-w-2xl font-body text-base-content/70">
          {assortmentLead}
        </p>

        <AssortmentCarousel />
      </div>
    </section>
  );
}
