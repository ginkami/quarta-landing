import { processSteps, sections } from "@/content/landing";

export function Process() {
  return (
    <section id={sections.process} className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
          От заявки до чашки
        </p>
        <h2 className="font-heading mt-3 text-4xl md:text-5xl">Как это работает</h2>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((step, index) => (
            <li
              key={step}
              className="rounded-2xl border border-base-300 bg-base-300 p-5"
            >
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-primary font-heading text-xl text-primary-content"
              >
                {index + 1}
              </span>
              <p className="mt-3 font-body">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
