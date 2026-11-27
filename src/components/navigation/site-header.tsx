"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/shared/logo";
import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { NAV_LINKS, visibleLinks } from "@/components/navigation/nav-links";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface SiteHeaderProps {
  currentUser: User | null;
}

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks(NAV_LINKS, Boolean(currentUser)).map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/#how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <Link
                href="/create-listing"
                className="hidden rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
              >
                Create a listing
              </Link>
              <Link href="/profile" aria-label="Profile">
                <TravelerAvatar user={currentUser} size="sm" />
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Log out"
                  title="Log out"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
