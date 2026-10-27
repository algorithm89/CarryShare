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
import {
  authorizeCommitment as authorizeCommitmentRecord,
  cancelProtection as cancelProtectionRecord,
  createProtectionForMatch,
  getProtectionByMatchId,
  markProtectionCompleted as markProtectionCompletedRecord,
  reconfirmCommitment as reconfirmCommitmentRecord,
  reportNoShow as reportNoShowRecord,
  resolveClaim as resolveClaimRecord,
} from "@/data/protection";
import type {
  CancellationReason,
  ClaimResolution,
  Flight,
  Listing,
  Match,
  Message,
  Protection,
  ProtectionCommitment,
  Trip,
  User,
} from "@/types";

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
  /** CarryShare Protection status for this match, if protection has been set up. */
  protectionStatus?: Protection["status"];
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
  const protectionStatus = getProtectionByMatchId(match.id)?.status;
  return {
    ...match,
    flight,
    listing,
    requester,
    responder,
    counterpart,
    protectionStatus,
  };
}

/** 6 hours before departure, in ISO form. */
function computeReconfirmDeadline(flight: Flight): string {
  const departure = new Date(
    `${flight.departureDate}T${flight.departureTime}:00Z`
  );
  departure.setUTCHours(departure.getUTCHours() - 6);
  return departure.toISOString();
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
  const flight = getFlightById(listing.flightId);
  if (!flight) throw new Error(`Flight ${listing.flightId} not found`);

  const match = requestMatchRecord(
    listingId,
    requesterId,
    listing.userId,
    listing.flightId
  );

  // Every match gets a CarryShare Protection commitment, sized off the
  // listing's approximate weight (a simple illustrative placeholder rate
  // until a real baggage-fee source is wired in).
  const totalAmountCents = Math.max(3000, Math.round(listing.approxWeightKg * 800));
  createProtectionForMatch(
    match.id,
    requesterId,
    listing.userId,
    totalAmountCents,
    computeReconfirmDeadline(flight)
  );

  return resolveAfterLatency(match);
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

// ---------------------------------------------------------------------------
// CarryShare Protection
// ---------------------------------------------------------------------------

export interface ProtectionCommitmentWithUser extends ProtectionCommitment {
  user: User;
}

export interface ProtectionWithDetails extends Omit<Protection, "commitments"> {
  commitments: [ProtectionCommitmentWithUser, ProtectionCommitmentWithUser];
}

function attachProtectionDetails(protection: Protection): ProtectionWithDetails {
  const commitments = protection.commitments.map((commitment) => {
    const user = getUserById(commitment.userId);
    if (!user) {
      throw new Error(`No user found for commitment ${commitment.userId}`);
    }
    return { ...commitment, user };
  }) as [ProtectionCommitmentWithUser, ProtectionCommitmentWithUser];
  return { ...protection, commitments };
}

export async function getProtectionForMatch(
  matchId: string
): Promise<ProtectionWithDetails | undefined> {
  const protection = getProtectionByMatchId(matchId);
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}

export async function authorizeMyCommitment(
  matchId: string,
  userId: string
): Promise<ProtectionWithDetails | undefined> {
  const protection = authorizeCommitmentRecord(matchId, userId);
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}

export async function reconfirmMyTrip(
  matchId: string,
  userId: string
): Promise<ProtectionWithDetails | undefined> {
  const protection = reconfirmCommitmentRecord(matchId, userId);
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}

export async function cancelMatchProtection(
  matchId: string,
  userId: string,
  reason: CancellationReason
): Promise<ProtectionWithDetails | undefined> {
  const protection = cancelProtectionRecord(matchId, userId, reason);
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}

export async function reportNoShow(
  matchId: string,
  reportedByUserId: string,
  aboutUserId: string,
  receiptFileName?: string,
  note?: string
): Promise<ProtectionWithDetails | undefined> {
  const protection = reportNoShowRecord(
    matchId,
    reportedByUserId,
    aboutUserId,
    receiptFileName,
    note
  );
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}

/** Demo-only: in production this is a platform review decision, not a user action. */
export async function resolveProtectionClaim(
  matchId: string,
  resolution: ClaimResolution
): Promise<ProtectionWithDetails | undefined> {
  const protection = resolveClaimRecord(matchId, resolution);
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}

/** Demo-only: simulates the trip having gone off without a hitch. */
export async function markProtectionCompleted(
  matchId: string
): Promise<ProtectionWithDetails | undefined> {
  const protection = markProtectionCompletedRecord(matchId);
  return resolveAfterLatency(
    protection ? attachProtectionDetails(protection) : undefined
  );
}
