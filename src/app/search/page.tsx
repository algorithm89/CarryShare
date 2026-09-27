import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";
import { SearchResults } from "@/components/search/search-results";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { searchFlights } from "@/lib/services";

interface SearchPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    flight?: string;
    date?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const flights = await searchFlights({
    origin: params.from,
    destination: params.to,
    flightNumber: params.flight,
    date: params.date,
  });

  if (flights.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={PlaneTakeoff}
          title="No flights matched your search"
          description="Double-check the flight number, route, or date — or browse all upcoming flights instead."
          action={
            <Link href="/search" className={buttonVariants()}>
              Browse all flights
            </Link>
          }
        />
      </div>
    );
  }

  return <SearchResults flights={flights} initialFlightId={flights[0].id} />;
}
