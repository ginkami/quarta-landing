import { business, contacts, site } from "@/content/landing";

export interface BusinessJsonLd {
  "@context": "https://schema.org";
  "@type": "CoffeeShop";
  name: string;
  url: string;
  telephone: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
  };
  openingHoursSpecification: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
}

/**
 * JSON-LD structured data for the local business (landing-seo capability).
 */
export function buildBusinessJsonLd(): BusinessJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CoffeeShop",
    name: business.name,
    url: site.url,
    telephone: contacts.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.street,
      addressLocality: business.city,
      addressCountry: "BY",
    },
    openingHoursSpecification: business.openingHours.map(({ days, time }) => {
      const [opens = "", closes = ""] = time.split("-");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days.split(" "),
        opens,
        closes,
      };
    }),
  };
}
