import Image from "next/image";
import { hero, sections } from "@/content/landing";

export function Hero() {
  return (
    <section
      className="relative flex min-h-[80svh] items-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <Image
        src="/images/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#1d1b17]/90 via-[#1d1b17]/75 to-[#56331e]/60"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20">
        <p className="font-caption text-sm uppercase tracking-[0.35em] text-base-300">
          Минск · с 2019 года
        </p>
        <p className="font-heading mt-6 text-6xl leading-none text-base-100 md:text-8xl">
          КВАРТА
        </p>
        <h1
          id="hero-title"
          className="font-heading mt-4 text-3xl text-base-100 md:text-5xl"
        >
          {hero.title}
        </h1>
        <p className="mt-5 max-w-2xl font-body text-lg text-base-100/90 md:text-xl">
          {hero.lead}
        </p>
        <p className="badge badge-pill badge-primary mt-6 font-caption text-sm font-normal">
          {hero.freshness}
        </p>
        <div className="mt-8">
          <a
            href={`#${sections.request}`}
            className="btn btn-primary btn-lg border border-base-100/40"
          >
            {hero.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
