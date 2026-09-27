import Link from "next/link";
import { ChevronRight, PackageSearch, PackagePlus, Weight } from "lucide-react";
import { TravelerCard } from "@/components/traveler/traveler-card";
import { Badge } from "@/components/ui/badge";
import { ITEM_CATEGORY_LABELS } from "@/types";
import type { ListingWithTraveler } from "@/lib/services";

interface ListingCardProps {
  listing: ListingWithTraveler;
}

export function ListingCard({ listing }: ListingCardProps) {
  const needsSpace = listing.type === "needs_space";

  return (
    <Link
      href={`/match/${listing.id}`}
      className="group flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <TravelerCard user={listing.traveler} />
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={needsSpace ? "outline" : "default"}
          className={
            needsSpace
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : "bg-primary text-primary-foreground"
          }
        >
          {needsSpace ? (
            <PackageSearch className="size-3" />
          ) : (
            <PackagePlus className="size-3" />
          )}
          {needsSpace ? "Needs luggage space" : "Has space / will share"}
        </Badge>
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <Weight className="size-3" />
          {needsSpace ? "Approx." : "Up to"} {listing.approxWeightKg} kg
        </Badge>
      </div>

      {listing.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {listing.description}
        </p>
      )}

      {listing.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {listing.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {ITEM_CATEGORY_LABELS[category]}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
