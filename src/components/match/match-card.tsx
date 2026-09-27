import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { Badge } from "@/components/ui/badge";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MatchWithDetails } from "@/lib/services";
import type { MatchStatus } from "@/types";

interface MatchCardProps {
  match: MatchWithDetails;
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  pending: "Awaiting reply",
  accepted: "Confirmed",
  declined: "Declined",
  completed: "Completed",
};

const STATUS_CLASSES: Record<MatchStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-teal-50 text-teal-700",
  declined: "bg-muted text-muted-foreground",
  completed: "bg-sky-50 text-sky-700",
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Link
      href={`/messages?match=${match.id}`}
      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/60"
    >
      <TravelerAvatar user={match.counterpart} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {fullName(match.counterpart)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {match.flight.flightNumber} &middot; {match.flight.originCode}
          {" → "}
          {match.flight.destinationCode}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn("shrink-0 border-transparent", STATUS_CLASSES[match.status])}
      >
        {STATUS_LABEL[match.status]}
      </Badge>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
