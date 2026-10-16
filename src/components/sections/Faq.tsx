"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq, sections } from "@/content/landing";

export function Faq() {
  return (
    <section id={sections.faq} className="scroll-mt-20 bg-block/30 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
            Частые вопросы
          </p>
          <h2 className="font-heading mt-3 text-4xl md:text-5xl">FAQ</h2>
          <p className="mt-3 font-body text-muted-foreground">
            Не нашли ответ? Напишите нам — расскажем подробнее.
          </p>
        </div>

        <Accordion className="md:col-span-2">
          {faq.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-4 font-heading text-lg hover:no-underline md:text-xl">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-base md:text-lg">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
