import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import { AttributionTracker } from "@/components/tracking/AttributionTracker";
import { site } from "@/content/landing";
import "./globals.css";
import { cn } from "@/lib/utils";

const headingFont = localFont({
  src: "../fonts/YanoneKaffeesatz-Bold.woff2",
  variable: "--font-yk",
  weight: "700",
  display: "swap",
});

const bodyFont = localFont({
  src: "../fonts/PTSerif-Regular.woff2",
  variable: "--font-pt-serif",
  weight: "400",
  display: "swap",
});

const captionFont = localFont({
  src: "../fonts/PTSans-Regular.woff2",
  variable: "--font-pt-sans",
  weight: "400",
  display: "swap",
});

const priceFont = localFont({
  src: "../fonts/PTMono-Regular.woff2",
  variable: "--font-pt-mono",
  weight: "400",
  display: "swap",
});

const nbrbFont = localFont({
  src: "../fonts/nbrb.woff2",
  variable: "--font-nbrb",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={cn("h-full", "antialiased", headingFont.variable, bodyFont.variable, captionFont.variable, priceFont.variable, nbrbFont.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <AttributionTracker />
        <Analytics />
      </body>
    </html>
  );
}
