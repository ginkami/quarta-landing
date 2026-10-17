import Image from "next/image";
import { Button } from "@/components/ui/button";
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
        <p className="font-caption text-sm uppercase tracking-[0.35em] text-[#d5c2ad]">
          Минск · с 2019 года
        </p>
        <p className="font-heading mt-6 text-6xl leading-none text-[#faf6ee] md:text-8xl">
          КВАРТА
        </p>
        <h1
          id="hero-title"
          className="font-heading mt-4 text-3xl text-[#faf6ee] md:text-5xl"
        >
          {hero.title}
        </h1>
        <p className="mt-5 max-w-2xl font-body text-lg text-[#faf6ee]/90 md:text-xl">
          {hero.lead}
        </p>
        <p className="mt-6 inline-block rounded-full bg-primary px-4 py-2 font-caption text-sm text-primary-foreground">
          {hero.freshness}
        </p>
        <div className="mt-8">
          <Button
            render={<a href={`#${sections.request}`} />}
            nativeButton={false}
            className="h-12 border border-[#faf6ee]/40 px-8 text-base"
          >
            {hero.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
