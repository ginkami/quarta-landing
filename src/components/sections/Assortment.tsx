import Image from "next/image";
import { BynIcon } from "@/components/ui/BynIcon";
import { assortment, sections } from "@/content/landing";

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
          Обжариваем партиями по 5 кг — в пачке всегда свежий кофе.
        </p>

        <div className="carousel carousel-center scroll-smooth mt-10 w-full gap-4">
          {assortment.map((product, index) => (
            <div
              key={product.id}
              id={`assortment-${index}`}
              className="carousel-item w-[85%] sm:w-1/2 lg:w-1/3"
            >
              <article className="card w-full border border-base-300 bg-base-100 p-4">
                <figure>
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={600}
                    height={900}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                    className="aspect-[2/3] w-full rounded-box object-cover"
                  />
                </figure>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <h3 className="font-heading text-2xl">{product.title}</h3>
                  <p className="font-price whitespace-nowrap text-xl font-semibold text-primary">
                    {product.price} <BynIcon />
                  </p>
                </div>
                <p className="mt-1 font-caption text-sm text-base-content/70">
                  {product.description}
                </p>
              </article>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <div className="join">
            {assortment.map((product, index) => (
              <a
                key={product.id}
                href={`#assortment-${index}`}
                aria-label={`Товар: ${product.title}`}
                className="btn btn-outline btn-sm join-item"
              >
                {index + 1}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
