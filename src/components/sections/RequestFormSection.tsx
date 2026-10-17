import { requestForm, sections } from "@/content/landing";
import { RequestForm } from "./RequestForm";

export function RequestFormSection() {
  return (
    <section id={sections.request} className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
            {requestForm.kicker}
          </p>
          <h2 className="font-heading mt-3 text-4xl md:text-5xl">
            {requestForm.title}
          </h2>
          <p className="mt-3 font-body text-base-content/70">{requestForm.lead}</p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-300/30 p-6 md:col-span-2 md:p-8">
          <RequestForm />
        </div>
      </div>
    </section>
  );
}
