/**
 * Data-access layer for CarryShare.
 *
 * Every function here reads from / writes to the in-memory mock data in
 * `src/data`. Nothing in the UI should import from `src/data` directly —
 * routing everything through this file means we can later swap the
 * implementations for real Supabase/PostgreSQL calls (and make them `async`
 * for real, since most already return Promises) without touching a single
 * component.
 */

import {
  createListing as createListingRecord,
  type CreateListingInput,
  getListingById,
  getListingsForFlight,
  getListingsForUser,
  type ListingFilters,
} from "@/data/listings";
import {
  getFlightById,
  getFlights,
  searchFlights as searchFlightsRecords,
  type FlightSearchParams,
} from "@/data/flights";
import {
  getMatchById,
  getMatchesForUser,
  requestMatch as requestMatchRecord,
} from "@/data/matches";
import {
  getMessagesForMatch,
  sendMessage as sendMessageRecord,
} from "@/data/messages";
import { getTripsForUser, upsertTripForListing } from "@/data/trips";
import { CURRENT_USER_ID, getCurrentUser, getUserById } from "@/data/users";
import type { Flight, Listing, Match, Message, Trip, User } from "@/types";

// Simulates network latency so loading states feel real. Set to 0 to disable.
const MOCK_LATENCY_MS = 0;

function resolveAfterLatency<T>(value: T): Promise<T> {
  if (MOCK_LATENCY_MS === 0) return Promise.resolve(value);
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

// ---------------------------------------------------------------------------
// Flights
// ---------------------------------------------------------------------------

export async function getAllFlights(): Promise<Flight[]> {
  return resolveAfterLatency(getFlights());
}

export async function getFlight(id: string): Promise<Flight | undefined> {
  return resolveAfterLatency(getFlightById(id));
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<Flight[]> {
  return resolveAfterLatency(searchFlightsRecords(params));
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUser(id: string): Promise<User | undefined> {
  return resolveAfterLatency(getUserById(id));
}

export async function getLoggedInUser(): Promise<User> {
  return resolveAfterLatency(getCurrentUser());
}

export { CURRENT_USER_ID };

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export interface ListingWithTraveler extends Listing {
  traveler: User;
}

function attachTraveler(listing: Listing): ListingWithTraveler {
  const traveler = getUserById(listing.userId);
  if (!traveler) {
    throw new Error(`No user found for listing ${listing.id}`);
  }
  return { ...listing, traveler };
}

export async function getListingsForFlightWithTravelers(
  flightId: string,
  filters: ListingFilters = {}
): Promise<ListingWithTraveler[]> {
  return resolveAfterLatency(
    getListingsForFlight(flightId, filters).map(attachTraveler)
  );
}

export async function getListing(
  id: string
): Promise<ListingWithTraveler | undefined> {
  const listing = getListingById(id);
  return resolveAfterLatency(listing ? attachTraveler(listing) : undefined);
}

export async function getListingsForCurrentUser(): Promise<Listing[]> {
  return resolveAfterLatency(getListingsForUser(CURRENT_USER_ID));
}

export async function createListing(
  input: CreateListingInput
): Promise<Listing> {
  const listing = createListingRecord(input);
  upsertTripForListing(input.userId, input.flightId, listing.id);
  return resolveAfterLatency(listing);
}

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------

export interface MatchWithDetails extends Match {
  flight: Flight;
  listing: Listing;
  requester: User;
  responder: User;
  /** The user on the other side of the current logged-in user, if applicable. */
  counterpart: User;
}

function attachMatchDetails(match: Match): MatchWithDetails {
  const flight = getFlightById(match.flightId);
  const listing = getListingById(match.listingId);
  const requester = getUserById(match.requesterId);
  const responder = getUserById(match.responderId);
  if (!flight || !listing || !requester || !responder) {
    throw new Error(`Incomplete mock data for match ${match.id}`);
  }
  const counterpart =
    match.requesterId === CURRENT_USER_ID ? responder : requester;
  return { ...match, flight, listing, requester, responder, counterpart };
}

export async function getMatch(
  id: string
): Promise<MatchWithDetails | undefined> {
  const match = getMatchById(id);
  return resolveAfterLatency(match ? attachMatchDetails(match) : undefined);
}

export async function getMatchesForCurrentUser(): Promise<
  MatchWithDetails[]
> {
  return resolveAfterLatency(
    getMatchesForUser(CURRENT_USER_ID).map(attachMatchDetails)
  );
}

export async function getMatchForListing(
  listingId: string
): Promise<MatchWithDetails | undefined> {
  const existing = getMatchesForUser(CURRENT_USER_ID).find(
    (match) => match.listingId === listingId
  );
  return resolveAfterLatency(existing ? attachMatchDetails(existing) : undefined);
}

export async function requestMatch(
  listingId: string,
  requesterId: string
): Promise<Match> {
  const listing = getListingById(listingId);
  if (!listing) throw new Error(`Listing ${listingId} not found`);
  return resolveAfterLatency(
    requestMatchRecord(listingId, requesterId, listing.userId, listing.flightId)
  );
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function getMessages(matchId: string): Promise<Message[]> {
  return resolveAfterLatency(getMessagesForMatch(matchId));
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  text: string
): Promise<Message> {
  return resolveAfterLatency(sendMessageRecord(matchId, senderId, text));
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export interface TripWithDetails extends Trip {
  flight: Flight;
  matches: MatchWithDetails[];
}

export async function getTripsForCurrentUser(): Promise<TripWithDetails[]> {
  const userTrips = getTripsForUser(CURRENT_USER_ID);
  const userMatches = getMatchesForUser(CURRENT_USER_ID).map(
    attachMatchDetails
  );
  const details = userTrips
    .map((trip) => {
      const flight = getFlightById(trip.flightId);
      if (!flight) return undefined;
      const tripMatches = userMatches.filter(
        (match) => match.flightId === trip.flightId
      );
      return { ...trip, flight, matches: tripMatches };
    })
    .filter((trip): trip is TripWithDetails => trip !== undefined);
  return resolveAfterLatency(details);
}
