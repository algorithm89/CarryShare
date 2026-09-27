"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlaneTakeoff, Plus } from "lucide-react";
import { FlightCard } from "@/components/flight/flight-card";
import { MatchCard } from "@/components/match/match-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTripsForCurrentUser } from "@/lib/services";
import type { TripWithDetails } from "@/lib/services";

export default function TripsPage() {
  const [trips, setTrips] = useState<TripWithDetails[] | null>(null);

  useEffect(() => {
    getTripsForCurrentUser().then(setTrips);
  }, []);

  const upcoming = trips?.filter((trip) => trip.status === "upcoming") ?? [];
  const past = trips?.filter((trip) => trip.status === "completed") ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          My Trips
        </h1>
        <Link
          href="/create-listing"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus className="size-4" />
          New listing
        </Link>
      </div>

      {trips === null ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="mt-5">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={PlaneTakeoff}
                title="No upcoming trips yet"
                description="Create a listing for your next flight to get started."
                action={
                  <Link href="/create-listing" className={buttonVariants()}>
                    Create a listing
                  </Link>
                }
              />
            ) : (
              upcoming.map((trip) => <TripCard key={trip.id} trip={trip} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {past.length === 0 ? (
              <EmptyState
                icon={PlaneTakeoff}
                title="No past trips yet"
                description="Your completed CarryShares will show up here."
              />
            ) : (
              past.map((trip) => <TripCard key={trip.id} trip={trip} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function TripCard({ trip }: { trip: TripWithDetails }) {
  const isPast = trip.status === "completed";
  const matchCount = trip.matches.length;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/10 sm:p-5">
      <FlightCard flight={trip.flight} variant="compact" />

      <div className="mt-3 flex items-center gap-2">
        {isPast ? (
          <Badge variant="outline" className="text-muted-foreground">
            Completed
          </Badge>
        ) : matchCount > 0 ? (
          <Badge className="bg-primary text-primary-foreground">
            {matchCount} potential match{matchCount === 1 ? "" : "es"}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            No matches yet
          </Badge>
        )}
      </div>

      {matchCount > 0 && (
        <>
          <Separator className="my-3" />
          <div className="-mx-2">
            {trip.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
