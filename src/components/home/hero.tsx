import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { FlightSearch } from "@/components/flight/flight-search";

export function Hero() {
  return (
    <section className="relative z-0 overflow-hidden bg-background">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[520px] sm:h-[640px]"
      >
        <Image
          src="/BG3.png"
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/30 to-background" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-14 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-900/10">
            <Sparkles className="size-3.5" />
            Travel smarter, together
          </span>

          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Share the Journey.
            <br />
            Share the Bag.
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-balance text-base text-muted-foreground sm:text-lg">
            CarryShare helps travelers on the same flight connect and
            coordinate sharing extra luggage space &mdash; so that spare
            bottle of wine or last souvenir doesn&apos;t have to stay behind.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#find-flight"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              Find my flight
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-6 text-base font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted sm:w-auto"
            >
              How CarryShare Works
            </a>
          </div>
        </div>

        <div id="find-flight" className="mx-auto mt-10 max-w-3xl scroll-mt-24">
          <FlightSearch />
        </div>
      </div>
    </section>
  );
}
