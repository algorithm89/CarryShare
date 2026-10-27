import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  HandCoins,
  Hourglass,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProtectionStatus } from "@/types";

export const PROTECTION_STATUS_CONFIG: Record<
  ProtectionStatus,
  { label: string; icon: typeof ShieldCheck; classes: string }
> = {
  awaiting_commitment: {
    label: "Awaiting commitment",
    icon: ShieldQuestion,
    classes: "bg-amber-50 text-amber-700",
  },
  committed: {
    label: "Committed",
    icon: ShieldCheck,
    classes: "bg-sky-50 text-sky-700",
  },
  reconfirmed: {
    label: "Reconfirmed",
    icon: CheckCircle2,
    classes: "bg-teal-50 text-teal-700",
  },
  cancelled_no_penalty: {
    label: "Cancelled · no penalty",
    icon: Ban,
    classes: "bg-muted text-muted-foreground",
  },
  cancelled_late: {
    label: "Late cancellation",
    icon: AlertTriangle,
    classes: "bg-orange-50 text-orange-700",
  },
  no_show_reported: {
    label: "No-show reported",
    icon: Hourglass,
    classes: "bg-orange-50 text-orange-700",
  },
  resolved_charged: {
    label: "Claim approved",
    icon: HandCoins,
    classes: "bg-rose-50 text-rose-700",
  },
  resolved_waived: {
    label: "Claim waived",
    icon: Clock,
    classes: "bg-muted text-muted-foreground",
  },
  completed: {
    label: "Trip completed",
    icon: CheckCircle2,
    classes: "bg-teal-50 text-teal-700",
  },
};

interface ProtectionStatusBadgeProps {
  status: ProtectionStatus;
  className?: string;
}

export function ProtectionStatusBadge({
  status,
  className,
}: ProtectionStatusBadgeProps) {
  const config = PROTECTION_STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-transparent", config.classes, className)}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
