import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { PopularFlights } from "@/components/home/popular-flights";
import { TrustSection } from "@/components/home/trust-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <PopularFlights />
      <TrustSection />
    </>
  );
}
