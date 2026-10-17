import { Assortment } from "@/components/sections/Assortment";
import { Contacts } from "@/components/sections/Contacts";
import { Delivery } from "@/components/sections/Delivery";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { RequestFormSection } from "@/components/sections/RequestFormSection";
import { Subscription } from "@/components/sections/Subscription";
import { buildBusinessJsonLd } from "@/lib/json-ld";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBusinessJsonLd()),
        }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Assortment />
        <Subscription />
        <Delivery />
        <Process />
        <Faq />
        <RequestFormSection />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
