import { BadgeCheck, Clock, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types";

interface TrustBadgeProps {
  status: VerificationStatus;
  label?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { icon: typeof BadgeCheck; text: string; classes: string }
> = {
  verified: {
    icon: BadgeCheck,
    text: "Verified",
    classes: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  pending: {
    icon: Clock,
    text: "Pending verification",
    classes:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  unverified: {
    icon: ShieldQuestion,
    text: "Unverified",
    classes: "bg-muted text-muted-foreground",
  },
};

export function TrustBadge({ status, label, className }: TrustBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.classes,
        className
      )}
    >
      <Icon className="size-3.5" />
      {label ?? config.text}
    </span>
  );
}
