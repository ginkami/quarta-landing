import { renderBynText } from "@/components/ui/BynIcon";
import { faq, sections } from "@/content/landing";

export function Faq() {
  return (
    <section id={sections.faq} className="scroll-mt-20 bg-base-300/30 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
            Частые вопросы
          </p>
          <h2 className="font-heading mt-3 text-4xl md:text-5xl">FAQ</h2>
          <p className="mt-3 font-body text-base-content/70">
            Не нашли ответ? Напишите нам — расскажем подробнее.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Частые вопросы"
          className="join join-vertical w-full md:col-span-2"
        >
          {faq.map((item, index) => (
            <div
              key={item.question}
              className="collapse collapse-arrow join-item border border-base-300 bg-base-100"
            >
              <input
                type="radio"
                name="faq-collapse"
                aria-label={item.question}
                defaultChecked={index === 0}
              />
              <div className="collapse-title font-heading text-lg md:text-2xl">
                {item.question}
              </div>
              <div className="collapse-content">
                <p className="font-body text-base">{renderBynText(item.answer)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
