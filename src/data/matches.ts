import type { Match } from "@/types";

export const matches: Match[] = [
  {
    id: "m1",
    listingId: "l3",
    requesterId: "u1",
    responderId: "u4",
    flightId: "f1",
    status: "pending",
    createdAt: "2026-09-19T10:00:00Z",
  },
  {
    id: "m2",
    listingId: "l5",
    requesterId: "u2",
    responderId: "u1",
    flightId: "f1",
    status: "accepted",
    createdAt: "2026-09-13T09:15:00Z",
  },
  {
    id: "m3",
    listingId: "l9",
    requesterId: "u1",
    responderId: "u2",
    flightId: "f6",
    status: "completed",
    createdAt: "2026-07-20T09:15:00Z",
  },
];

let nextMatchId = matches.length + 1;

export function getMatches(): Match[] {
  return matches;
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((match) => match.id === id);
}

export function getMatchesForUser(userId: string): Match[] {
  return matches.filter(
    (match) => match.requesterId === userId || match.responderId === userId
  );
}

export function requestMatch(
  listingId: string,
  requesterId: string,
  responderId: string,
  flightId: string
): Match {
  const match: Match = {
    id: `m${nextMatchId++}`,
    listingId,
    requesterId,
    responderId,
    flightId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  matches.push(match);
  return match;
}
