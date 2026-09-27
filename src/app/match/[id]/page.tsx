"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, PackageCheck, SearchX, Weight } from "lucide-react";
import { FlightCard } from "@/components/flight/flight-card";
import { TravelerCard } from "@/components/traveler/traveler-card";
import { RequestMatchActions } from "@/components/match/request-match-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getFlight,
  getListing,
  getMatchForListing,
  type ListingWithTraveler,
} from "@/lib/services";
import { ITEM_CATEGORY_LABELS } from "@/types";
import type { Flight, MatchStatus } from "@/types";

interface LoadedMatchDetail {
  listingId: string;
  listing?: ListingWithTraveler;
  flight?: Flight;
  existingMatch?: { id: string; status: MatchStatus };
}

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<LoadedMatchDetail | null>(null);
  const loading = result === null || result.listingId !== params.id;

  useEffect(() => {
    let cancelled = false;
    getListing(params.id).then(async (foundListing) => {
      if (!foundListing) {
        if (!cancelled) {
          setResult({ listingId: params.id });
        }
        return;
      }
      const [foundFlight, match] = await Promise.all([
        getFlight(foundListing.flightId),
        getMatchForListing(foundListing.id),
      ]);
      if (cancelled) return;
      setResult({
        listingId: params.id,
        listing: foundListing,
        flight: foundFlight,
        existingMatch: match
          ? { id: match.id, status: match.status }
          : undefined,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const listing = result?.listing;
  const flight = result?.flight;
  const existingMatch = result?.existingMatch;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!listing || !flight) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={SearchX}
          title="Listing not found"
          description="This listing may have been removed or the link is incorrect."
          action={
            <Link href="/search" className={buttonVariants()}>
              Back to search
            </Link>
          }
        />
      </div>
    );
  }

  const needsSpace = listing.type === "needs_space";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:p-6">
        <TravelerCard user={listing.traveler} size="lg" />

        <Separator className="my-5" />

        <FlightCard flight={flight} />

        <Separator className="my-5" />

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              needsSpace
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "bg-primary text-primary-foreground"
            }
            variant={needsSpace ? "outline" : "default"}
          >
            <PackageCheck className="size-3" />
            {needsSpace ? "Needs luggage space" : "Has space / will share"}
          </Badge>
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Weight className="size-3" />
            {needsSpace ? "Approx." : "Up to"} {listing.approxWeightKg} kg
          </Badge>
        </div>

        {listing.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {ITEM_CATEGORY_LABELS[category]}
              </span>
            ))}
          </div>
        )}

        {listing.description && (
          <p className="mt-3 text-sm text-muted-foreground">
            {listing.description}
          </p>
        )}

        <Separator className="my-5" />

        <RequestMatchActions
          listingId={listing.id}
          travelerFirstName={listing.traveler.firstName}
          initialMatch={existingMatch}
        />
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-medium">Safety notice:</span> CarryShare only
          helps travelers connect — it does not collect, inspect, or
          transport any items. You are responsible for reviewing the
          contents of any shared luggage and for complying with your
          airline&apos;s baggage policy and all customs, airport security,
          and destination-country regulations. CarryShare cannot guarantee
          that any item is permitted.
        </p>
      </div>
    </div>
  );
}
