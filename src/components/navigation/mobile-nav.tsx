"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_LINKS } from "@/components/navigation/nav-links";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-stretch justify-between px-2">
        {MOBILE_NAV_LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const isCreate = link.href === "/create-listing";
          const Icon = link.icon;

          if (isCreate) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
              >
                <span
                  className={cn(
                    "-mt-5 flex size-11 items-center justify-center rounded-full shadow-md transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {link.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
