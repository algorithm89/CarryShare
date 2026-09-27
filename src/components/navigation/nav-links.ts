import type { LucideIcon } from "lucide-react";
import { Home, Luggage, MessageCircle, PlusCircle, User } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Find a Flight", href: "/", icon: Home },
  { label: "My Trips", href: "/trips", icon: Luggage },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/profile", icon: User },
];

export const MOBILE_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Trips", href: "/trips", icon: Luggage },
  { label: "List", href: "/create-listing", icon: PlusCircle },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/profile", icon: User },
];
