import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllFlights } from "@/lib/services";
import { formatDateMedium } from "@/lib/format";

export async function PopularFlights() {
  const flights = (await getAllFlights()).slice(0, 4);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Flights with active listings
            </h2>
            <p className="mt-1 text-muted-foreground">
              Jump straight into a flight to see who&apos;s already looking to
              share space.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {flights.map((flight) => (
            <Link
              key={flight.id}
              href={`/search?flight=${flight.flightNumber}`}
              className="group flex items-center justify-between gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {flight.flightNumber} &middot; {flight.originCode}
                  {" → "}
                  {flight.destinationCode}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {flight.originCity} to {flight.destinationCity} &middot;{" "}
                  {formatDateMedium(flight.departureDate)}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
