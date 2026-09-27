import type { ItemCategory, Listing, ListingType } from "@/types";

export const listings: Listing[] = [
  {
    id: "l1",
    userId: "u2",
    flightId: "f1",
    type: "needs_space",
    categories: ["wine", "souvenirs"],
    approxWeightKg: 5,
    description: "2 bottles of wine + a few souvenirs from Rome.",
    status: "active",
    createdAt: "2026-09-12T09:00:00Z",
  },
  {
    id: "l2",
    userId: "u3",
    flightId: "f1",
    type: "has_space",
    categories: [],
    approxWeightKg: 10,
    description:
      "Packing light this trip — extra bag has room for up to 10 kg, happy to split the checked-bag fee.",
    status: "active",
    createdAt: "2026-09-10T14:30:00Z",
  },
  {
    id: "l3",
    userId: "u4",
    flightId: "f1",
    type: "needs_space",
    categories: ["clothing", "other"],
    approxWeightKg: 8,
    description: "A few boxes of ceramics and some extra clothes.",
    status: "active",
    createdAt: "2026-09-15T11:00:00Z",
  },
  {
    id: "l4",
    userId: "u5",
    flightId: "f1",
    type: "has_space",
    categories: [],
    approxWeightKg: 7,
    description: "Flying with just a carry-on, glad to share bag space.",
    status: "active",
    createdAt: "2026-09-16T08:45:00Z",
  },
  {
    id: "l5",
    userId: "u1",
    flightId: "f1",
    type: "has_space",
    categories: [],
    approxWeightKg: 10,
    description: "Have room in my checked bag, happy to share the cost.",
    status: "matched",
    createdAt: "2026-09-08T10:00:00Z",
  },
  {
    id: "l6",
    userId: "u7",
    flightId: "f1",
    type: "needs_space",
    categories: ["food", "souvenirs"],
    approxWeightKg: 4,
    description: "Bringing home some specialty olive oil and pasta.",
    status: "active",
    createdAt: "2026-09-18T16:20:00Z",
  },
  {
    id: "l7",
    userId: "u6",
    flightId: "f2",
    type: "needs_space",
    categories: ["clothing"],
    approxWeightKg: 6,
    description: "Extra clothes and gifts for family in New York.",
    status: "active",
    createdAt: "2026-09-19T12:00:00Z",
  },
  {
    id: "l8",
    userId: "u4",
    flightId: "f2",
    type: "has_space",
    categories: [],
    approxWeightKg: 12,
    description: "Business trip, bag is nearly empty — happy to share.",
    status: "active",
    createdAt: "2026-09-20T07:30:00Z",
  },
  {
    id: "l9",
    userId: "u2",
    flightId: "f6",
    type: "needs_space",
    categories: ["wine"],
    approxWeightKg: 3,
    description: "A bottle of Malbec for the trip home.",
    status: "completed",
    createdAt: "2026-07-18T09:00:00Z",
  },
];

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
