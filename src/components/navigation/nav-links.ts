import type { LucideIcon } from "lucide-react";
import { Home, Luggage, MessageCircle, PlusCircle, User } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hidden from the nav when nobody is logged in. */
  requiresAuth?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Find a Flight", href: "/", icon: Home },
  { label: "My Trips", href: "/trips", icon: Luggage, requiresAuth: true },
  { label: "Messages", href: "/messages", icon: MessageCircle, requiresAuth: true },
  { label: "Profile", href: "/profile", icon: User, requiresAuth: true },
];

export const MOBILE_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Trips", href: "/trips", icon: Luggage, requiresAuth: true },
  { label: "List", href: "/create-listing", icon: PlusCircle, requiresAuth: true },
  { label: "Messages", href: "/messages", icon: MessageCircle, requiresAuth: true },
  { label: "Profile", href: "/profile", icon: User, requiresAuth: true },
];

export function visibleLinks(links: NavLink[], loggedIn: boolean): NavLink[] {
  return loggedIn ? links : links.filter((link) => !link.requiresAuth);
}
