"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { assortment, sections } from "@/content/landing";

export function Assortment() {
  return (
    <section id={sections.assortment} className="scroll-mt-20 bg-block/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-caption text-sm uppercase tracking-[0.25em] text-primary">
          Что обжариваем
        </p>
        <h2 className="font-heading mt-3 text-4xl md:text-5xl">Ассортимент</h2>
        <p className="mt-3 max-w-2xl font-body text-muted-foreground">
          Обжариваем партиями по 5 кг — в пачке всегда свежий кофе.
        </p>

        <Carousel opts={{ align: "start" }} className="mt-10 w-full">
          <CarouselContent>
            {assortment.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <article className="flex h-full flex-col rounded-2xl border border-line bg-background p-4">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={600}
                    height={900}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                    className="aspect-[2/3] w-full rounded-xl object-cover"
                  />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className="font-heading text-2xl">{product.title}</h3>
                    <p className="font-price whitespace-nowrap text-xl font-semibold text-primary">
                      {product.price} BYN
                    </p>
                  </div>
                  <p className="mt-1 font-caption text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex items-center justify-end gap-3">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
