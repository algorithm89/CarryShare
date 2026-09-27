import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { TrustBadge } from "@/components/shared/trust-badge";
import { Rating } from "@/components/shared/rating";
import { Separator } from "@/components/ui/separator";
import { fullName } from "@/lib/format";
import type { User } from "@/types";

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
        <TravelerAvatar user={user} size="lg" className="size-20 text-xl" />
        <div className="flex-1">
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
            <h1 className="font-heading text-xl font-semibold text-foreground">
              {fullName(user)}
            </h1>
            <TrustBadge status={user.verification.identity} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {user.homeCity}, {user.homeCountry}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
            <Rating value={user.rating} reviewCount={user.reviewCount} size="md" />
          </div>
          {user.bio && (
            <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
          )}
        </div>
      </div>

      <Separator className="my-5" />

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Trips" value={user.tripsCompleted} />
        <Stat label="CarryShares" value={user.carrySharesCompleted} />
        <Stat
          label="Member since"
          value={new Date(user.memberSince).getFullYear()}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/60 py-3">
      <p className="font-heading text-lg font-semibold text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
