import type { User } from "@/types";

/**
 * In-memory user directory. Starts empty: real accounts live in PostgreSQL,
 * and the logged-in user is added here (in the browser) by `SessionSync`
 * so listings, matches and messages can refer to them.
 */
export const users: User[] = [];

let currentUserId: string | null = null;

/** Adds a user if not already known (keeps local counters on existing ones). */
export function upsertUser(user: User): User {
  const existing = getUserById(user.id);
  if (existing) return existing;
  users.push(user);
  return user;
}

export function setCurrentUser(user: User | null): void {
  if (user) upsertUser(user);
  currentUserId = user?.id ?? null;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getCurrentUser(): User | null {
  return currentUserId ? (getUserById(currentUserId) ?? null) : null;
}

export function recordLateCancellation(userId: string): void {
  const user = getUserById(userId);
  if (user) user.lateCancellationCount += 1;
}

export function recordNoShow(userId: string): void {
  const user = getUserById(userId);
  if (user) user.noShowCount += 1;
}
