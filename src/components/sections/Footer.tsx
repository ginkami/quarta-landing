import { brand, contacts } from "@/content/landing";

export function Footer() {
  return (
    <footer className="border-t border-line bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-heading text-2xl leading-none">{brand.name}</p>
          <p className="mt-1 font-caption text-sm text-muted-foreground">{brand.tagline}</p>
        </div>

        <div className="font-caption text-sm text-muted-foreground">
          <p>{contacts.address}</p>
          <p className="mt-1 flex gap-3">
            <a href={`tel:${contacts.phoneHref}`} className="transition-colors hover:text-primary">
              {contacts.phone}
            </a>
            <a
              href={contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-primary"
            >
              {contacts.instagramLabel}
            </a>
          </p>
        </div>

        <p className="font-caption text-sm text-muted-foreground">
          © {brand.name}, 2019–2026
        </p>
      </div>
    </footer>
  );
}
