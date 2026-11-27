"use client";

import { createContext, useContext } from "react";
import { setCurrentUser } from "@/data/users";
import type { User } from "@/types";

const SessionUserContext = createContext<User | null>(null);

/** The logged-in user (from the server session), or null. */
export function useSessionUser(): User | null {
  return useContext(SessionUserContext);
}

/**
 * Makes the server-side session user available to client components, and
 * registers it with the in-browser data store so listings, matches and
 * messages are created under the real account.
 */
export function SessionSync({ user, children }: { user: User | null; children: React.ReactNode }) {
  // Browser only: on the server the store is shared by every request.
  // Runs during render so children's effects already see the user.
  if (typeof window !== "undefined") setCurrentUser(user);

  return <SessionUserContext.Provider value={user}>{children}</SessionUserContext.Provider>;
}
