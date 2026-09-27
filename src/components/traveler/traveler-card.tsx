import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { TrustBadge } from "@/components/shared/trust-badge";
import { Rating } from "@/components/shared/rating";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface TravelerCardProps {
  user: User;
  size?: "sm" | "lg";
  className?: string;
}

export function TravelerCard({ user, size = "sm", className }: TravelerCardProps) {
  if (size === "lg") {
    return (
      <div className={cn("flex items-start gap-4", className)}>
        <TravelerAvatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold text-foreground">
            {fullName(user)}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.homeCity}, {user.homeCountry}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <TrustBadge status={user.verification.identity} />
            <Rating value={user.rating} reviewCount={user.reviewCount} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <TravelerAvatar user={user} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {fullName(user)}
        </p>
        <div className="flex items-center gap-2">
          <TrustBadge status={user.verification.identity} />
          <Rating value={user.rating} />
        </div>
      </div>
    </div>
  );
}
