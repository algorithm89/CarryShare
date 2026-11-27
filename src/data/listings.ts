import type { ItemCategory, Listing, ListingType } from "@/types";

export const listings: Listing[] = [];

let nextListingId = listings.length + 1;

export function getListings(): Listing[] {
  return listings;
}

export function getListingById(id: string): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}

export interface ListingFilters {
  type?: ListingType;
  category?: ItemCategory;
  maxWeightKg?: number;
}

export function getListingsForFlight(
  flightId: string,
  filters: ListingFilters = {}
): Listing[] {
  return listings.filter((listing) => {
    if (listing.flightId !== flightId) return false;
    if (filters.type && listing.type !== filters.type) return false;
    if (
      filters.category &&
      !listing.categories.includes(filters.category)
    ) {
      return false;
    }
    if (
      typeof filters.maxWeightKg === "number" &&
      listing.approxWeightKg > filters.maxWeightKg
    ) {
      return false;
    }
    return true;
  });
}

export function getListingsForUser(userId: string): Listing[] {
  return listings.filter((listing) => listing.userId === userId);
}

export interface CreateListingInput {
  userId: string;
  flightId: string;
  type: ListingType;
  categories: ItemCategory[];
  approxWeightKg: number;
  description?: string;
}

export function createListing(input: CreateListingInput): Listing {
  const listing: Listing = {
    id: `l${nextListingId++}`,
    userId: input.userId,
    flightId: input.flightId,
    type: input.type,
    categories: input.categories,
    approxWeightKg: input.approxWeightKg,
    description: input.description,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  listings.push(listing);
  return listing;
}
