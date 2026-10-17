import { brand, contacts } from "@/content/landing";

export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="footer mx-auto grid-cols-1 gap-5 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl leading-none">{brand.name}</p>
          <p className="mt-1 font-caption text-sm text-base-content/70">
            {brand.tagline}
          </p>
        </div>

        <div className="font-caption text-sm text-base-content/70 md:text-center">
          <p>{contacts.address}</p>
          <p className="mt-1 flex gap-3 md:justify-center">
            <a
              href={`tel:${contacts.phoneHref}`}
              className="link-hover link text-base-content"
            >
              {contacts.phone}
            </a>
            <a
              href={contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="link-hover link text-base-content"
            >
              {contacts.instagramLabel}
            </a>
          </p>
        </div>

        <p className="font-caption text-sm text-base-content/70 md:text-end">
          © {brand.name}, 2019–2026
        </p>
      </div>
    </footer>
  );
}
