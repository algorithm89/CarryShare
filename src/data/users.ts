import type { User } from "@/types";

/**
 * Mock user directory. `CURRENT_USER_ID` stands in for the authenticated
 * user until Supabase Auth is wired up.
 */
export const CURRENT_USER_ID = "u1";

export const users: User[] = [
  {
    id: "u1",
    firstName: "Alex",
    lastName: "Moreau",
    homeCity: "Montreal",
    homeCountry: "Canada",
    bio: "Frequent flyer between Europe and Canada. Happy to help fellow travelers share luggage space.",
    verification: { identity: "verified", email: "verified", phone: "verified" },
    rating: 4.9,
    reviewCount: 14,
    tripsCompleted: 9,
    carrySharesCompleted: 6,
    memberSince: "2025-02-11",
  },
  {
    id: "u2",
    firstName: "Sarah",
    lastName: "M.",
    homeCity: "Rome",
    homeCountry: "Italy",
    bio: "Wine enthusiast, always bringing back a bottle or two more than my suitcase can handle.",
    verification: { identity: "verified", email: "verified", phone: "pending" },
    rating: 4.9,
    reviewCount: 21,
    tripsCompleted: 15,
    carrySharesCompleted: 11,
    memberSince: "2024-11-03",
  },
  {
    id: "u3",
    firstName: "Daniel",
    lastName: "R.",
    homeCity: "Montreal",
    homeCountry: "Canada",
    bio: "I usually pack light, so I have extra room going both ways.",
    verification: { identity: "verified", email: "verified", phone: "verified" },
    rating: 4.8,
    reviewCount: 18,
    tripsCompleted: 22,
    carrySharesCompleted: 13,
    memberSince: "2024-06-20",
  },
  {
    id: "u4",
    firstName: "Marco",
    lastName: "T.",
    homeCity: "Rome",
    homeCountry: "Italy",
    bio: "Ceramics collector — always need a little extra space on the way home.",
    verification: { identity: "verified", email: "verified", phone: "unverified" },
    rating: 4.7,
    reviewCount: 9,
    tripsCompleted: 6,
    carrySharesCompleted: 4,
    memberSince: "2025-05-02",
  },
  {
    id: "u5",
    firstName: "Priya",
    lastName: "K.",
    homeCity: "Montreal",
    homeCountry: "Canada",
    bio: "Carry-on only traveler. Might as well put the extra bag allowance to good use.",
    verification: { identity: "verified", email: "verified", phone: "verified" },
    rating: 5.0,
    reviewCount: 7,
    tripsCompleted: 5,
    carrySharesCompleted: 5,
    memberSince: "2025-08-14",
  },
  {
    id: "u6",
    firstName: "Julien",
    lastName: "B.",
    homeCity: "Paris",
    homeCountry: "France",
    bio: "Bringing back gifts for the whole family every trip.",
    verification: { identity: "pending", email: "verified", phone: "verified" },
    rating: 4.6,
    reviewCount: 5,
    tripsCompleted: 4,
    carrySharesCompleted: 2,
    memberSince: "2025-09-30",
  },
  {
    id: "u7",
    firstName: "Emma",
    lastName: "W.",
    homeCity: "London",
    homeCountry: "United Kingdom",
    bio: "Food lover — I always come home with more olive oil than I planned for.",
    verification: { identity: "verified", email: "verified", phone: "verified" },
    rating: 4.9,
    reviewCount: 12,
    tripsCompleted: 10,
    carrySharesCompleted: 8,
    memberSince: "2025-01-22",
  },
];

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getCurrentUser(): User {
  const user = getUserById(CURRENT_USER_ID);
  if (!user) throw new Error("Current user not found in mock data");
  return user;
}
