import type { Match } from "@/types";

export const matches: Match[] = [];

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
