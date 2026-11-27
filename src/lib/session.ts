import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { User } from "@/types";

const COOKIE_NAME = "cs_session";
const SESSION_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session row and sets the httpOnly cookie. Call from a Server Action. */
export async function createSession(accountId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.query(
    "INSERT INTO sessions (token_hash, account_id, expires_at) VALUES ($1, $2, $3)",
    [hashToken(token), accountId, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Deletes the current session (row + cookie). Call from a Server Action. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  cookieStore.delete(COOKIE_NAME);
}

interface AccountRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  home_city: string;
  home_country: string;
  created_at: Date;
}

/** Shapes a database account into the app's `User` model. */
function toUser(row: AccountRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    homeCity: row.home_city,
    homeCountry: row.home_country,
    verification: { identity: "unverified", email: "unverified", phone: "unverified" },
    rating: 0,
    reviewCount: 0,
    tripsCompleted: 0,
    carrySharesCompleted: 0,
    memberSince: row.created_at.toISOString().slice(0, 10),
    lateCancellationCount: 0,
    noShowCount: 0,
  };
}

/**
 * The logged-in user, or null. Memoised per request, so the layout and the
 * page can both call it without a second query.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { rows } = await db.query<AccountRow>(
      `SELECT a.id, a.email, a.first_name, a.last_name, a.home_city, a.home_country, a.created_at
         FROM sessions s
         JOIN accounts a ON a.id = s.account_id
        WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [hashToken(token)]
    );
    return rows[0] ? toUser(rows[0]) : null;
  } catch (error) {
    // Database down: treat as logged out rather than crashing every page.
    console.error("[session] lookup failed", error);
    return null;
  }
});

/** Use in pages that need a logged-in user; sends everyone else to /login. */
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}
