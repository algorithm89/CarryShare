import type { Trip } from "@/types";

export const trips: Trip[] = [
  {
    id: "t1",
    userId: "u1",
    flightId: "f1",
    listingId: "l5",
    status: "upcoming",
  },
  {
    id: "t2",
    userId: "u1",
    flightId: "f6",
    status: "completed",
  },
];

let nextTripId = trips.length + 1;

export function getTripsForUser(userId: string): Trip[] {
  return trips.filter((trip) => trip.userId === userId);
}

/**
 * Ensures the user has an (upcoming) trip on this flight, creating one if
 * needed, and points it at the given listing. Called whenever a user
 * publishes a listing so it shows up under "My Trips" right away.
 */
export function upsertTripForListing(
  userId: string,
  flightId: string,
  listingId: string
): Trip {
  const existing = trips.find(
    (trip) => trip.userId === userId && trip.flightId === flightId
  );
  if (existing) {
    existing.listingId = listingId;
    return existing;
  }
  const trip: Trip = {
    id: `t${nextTripId++}`,
    userId,
    flightId,
    listingId,
    status: "upcoming",
  };
  trips.push(trip);
  return trip;
}
