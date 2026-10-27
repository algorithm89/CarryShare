/**
 * Core domain models for CarryShare.
 *
 * These interfaces are intentionally shaped to map cleanly onto future
 * Supabase/PostgreSQL tables (one interface per table, ids as strings/uuids,
 * foreign keys as `xxxId` fields, timestamps as ISO 8601 strings).
 */

export type VerificationStatus = "verified" | "pending" | "unverified";

export interface UserVerification {
  identity: VerificationStatus;
  email: VerificationStatus;
  phone: VerificationStatus;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  homeCity: string;
  homeCountry: string;
  bio?: string;
  verification: UserVerification;
  rating: number;
  reviewCount: number;
  tripsCompleted: number;
  carrySharesCompleted: number;
  memberSince: string; // ISO date
  /** CarryShare Protection trust history. */
  lateCancellationCount: number;
  noShowCount: number;
}

export interface Review {
  id: string;
  authorId: string;
  subjectId: string;
  matchId: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO datetime
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  originCode: string;
  originCity: string;
  originCountry: string;
  destinationCode: string;
  destinationCity: string;
  destinationCountry: string;
  departureDate: string; // ISO date, e.g. "2026-10-14"
  departureTime: string; // "13:30"
  arrivalTime: string; // "16:25"
}

export type ListingType = "needs_space" | "has_space";

export type ItemCategory =
  | "clothing"
  | "souvenirs"
  | "wine"
  | "food"
  | "artwork"
  | "other";

export type ListingStatus = "active" | "matched" | "completed" | "cancelled";

export interface Listing {
  id: string;
  userId: string;
  flightId: string;
  type: ListingType;
  categories: ItemCategory[];
  approxWeightKg: number;
  description?: string;
  status: ListingStatus;
  createdAt: string; // ISO datetime
}

export type MatchStatus = "pending" | "accepted" | "declined" | "completed";

export interface Match {
  id: string;
  listingId: string;
  requesterId: string;
  responderId: string;
  flightId: string;
  status: MatchStatus;
  createdAt: string; // ISO datetime
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  sentAt: string; // ISO datetime
  read: boolean;
}

export type TripStatus = "upcoming" | "completed";

export interface Trip {
  id: string;
  userId: string;
  flightId: string;
  listingId?: string;
  status: TripStatus;
}

// ---------------------------------------------------------------------------
// CarryShare Protection
//
// A lightweight commitment-and-accountability layer between two matched
// travelers. It is explicitly NOT insurance and does not process real
// payments in this prototype — "authorizing" and "charging" a commitment
// are mocked states only, modeling the UX for when real payments
// (Stripe + Supabase) are wired in later.
// ---------------------------------------------------------------------------

export type CommitmentStatus = "pending" | "authorized" | "charged" | "refunded";

export interface ProtectionCommitment {
  userId: string;
  amountCents: number;
  status: CommitmentStatus;
  authorizedAt?: string; // ISO datetime
  reconfirmedAt?: string; // ISO datetime
}

export type ProtectionStatus =
  | "awaiting_commitment" // one or both sides haven't authorized their share yet
  | "committed" // both authorized, waiting on trip reconfirmation window
  | "reconfirmed" // both reconfirmed before the cutoff
  | "cancelled_no_penalty" // cancelled before cutoff, or airline disruption
  | "cancelled_late" // self-reported cancellation after the cutoff
  | "no_show_reported" // counterpart reported a no-show after the fact
  | "resolved_charged" // claim reviewed: absent traveler's commitment charged
  | "resolved_waived" // claim reviewed: penalty waived
  | "completed"; // trip happened normally, commitments released

export type CancellationReason = "traveler_cancelled" | "airline_disruption";

export interface ProtectionCancellation {
  byUserId: string;
  reason: CancellationReason;
  at: string; // ISO datetime
}

export type ClaimResolution = "pending" | "approved" | "denied";

export interface NoShowClaim {
  reportedByUserId: string;
  aboutUserId: string;
  submittedAt: string; // ISO datetime
  receiptFileName?: string;
  note?: string;
  resolution: ClaimResolution;
  resolvedAt?: string; // ISO datetime
}

export interface Protection {
  id: string;
  matchId: string;
  totalAmountCents: number;
  /** Deadline for both travelers to reconfirm — defaults to 6h before departure. */
  reconfirmBy: string; // ISO datetime
  status: ProtectionStatus;
  commitments: [ProtectionCommitment, ProtectionCommitment];
  cancellation?: ProtectionCancellation;
  claim?: NoShowClaim;
}

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing: "Clothing",
  souvenirs: "Souvenirs",
  wine: "Wine",
  food: "Food",
  artwork: "Artwork",
  other: "Other",
};
