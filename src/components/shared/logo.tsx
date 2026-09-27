import Link from "next/link";
import { Luggage } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

/**
 * Temporary CarryShare wordmark. Swap the icon + text treatment here once
 * final brand assets are ready — every screen references this component.
 */
export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-heading font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Luggage className="size-4.5" strokeWidth={2.25} />
      </span>
      {!iconOnly && <span className="text-lg">CarryShare</span>}
    </Link>
  );
}
