"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  HandCoins,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CancelMatchDialog } from "@/components/protection/cancel-match-dialog";
import { ReportNoShowDialog } from "@/components/protection/report-no-show-dialog";
import { ProtectionStatusBadge } from "@/components/protection/protection-status-badge";
import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCents, formatRelativeToNow } from "@/lib/format";
import {
  authorizeMyCommitment,
  cancelMatchProtection,
  getLoggedInUser,
  getProtectionForMatch,
  markProtectionCompleted,
  reconfirmMyTrip,
  reportNoShow,
  resolveProtectionClaim,
} from "@/lib/services";
import type {
  ProtectionCommitmentWithUser,
  ProtectionWithDetails,
} from "@/lib/services";
import { cn } from "@/lib/utils";
import type { CancellationReason, Flight, User } from "@/types";

interface ProtectionPanelProps {
  matchId: string;
  flight: Flight;
}

export function ProtectionPanel({ matchId, flight }: ProtectionPanelProps) {
  const [result, setResult] = useState<{
    matchId: string;
    user: User;
    protection?: ProtectionWithDetails;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLoggedInUser(), getProtectionForMatch(matchId)]).then(
      ([user, protection]) => {
        if (!cancelled) setResult({ matchId, user, protection });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const loading = result === null || result.matchId !== matchId;

  function update(protection: ProtectionWithDetails | undefined) {
    setResult((prev) => (prev ? { ...prev, protection } : prev));
  }

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const { user, protection } = result;
  if (!protection) return null;

  const mine = protection.commitments.find((c) => c.userId === user.id);
  const theirs = protection.commitments.find((c) => c.userId !== user.id);
  if (!mine || !theirs) return null;
  const counterpart = theirs.user;

  async function handleAuthorize() {
    const updated = await authorizeMyCommitment(matchId, user.id);
    update(updated);
    toast.success("Commitment authorized", {
      description: `Your ${formatCents(mine!.amountCents)} share is locked in.`,
    });
  }

  async function handleReconfirm() {
    const updated = await reconfirmMyTrip(matchId, user.id);
    update(updated);
    toast.success("Trip reconfirmed");
  }

  async function handleCancel(reason: CancellationReason) {
    const updated = await cancelMatchProtection(matchId, user.id, reason);
    update(updated);
    if (updated?.status === "cancelled_late") {
      toast.warning("Match cancelled", {
        description: "This was after the cutoff, so it's marked as a late cancellation.",
      });
    } else {
      toast.success("Match cancelled — no penalty");
    }
  }

  async function handleReportClaim(receiptFileName?: string, note?: string) {
    const updated = await reportNoShow(
      matchId,
      user.id,
      counterpart.id,
      receiptFileName,
      note
    );
    update(updated);
    toast.success("Claim submitted for review");
  }

  async function handleResolve(resolution: "approved" | "denied") {
    const updated = await resolveProtectionClaim(matchId, resolution);
    update(updated);
    toast.message(
      resolution === "approved" ? "Claim approved (demo)" : "Claim waived (demo)"
    );
  }

  async function handleMarkCompleted() {
    const updated = await markProtectionCompleted(matchId);
    update(updated);
    toast.success("Trip marked as completed");
  }

  const canCancel = [
    "awaiting_commitment",
    "committed",
    "reconfirmed",
  ].includes(protection.status);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 font-heading text-base font-semibold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            CarryShare Protection
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A commitment tool between travelers — not insurance. Prototype
            only: no real charges happen here yet.
          </p>
        </div>
        <ProtectionStatusBadge status={protection.status} className="shrink-0" />
      </div>

      <Separator className="my-4" />

      <div className="space-y-2.5">
        <CommitmentRow
          label="You"
          commitment={mine}
          action={
            mine.status === "pending" &&
            protection.status === "awaiting_commitment" ? (
              <Button size="sm" onClick={handleAuthorize}>
                Authorize {formatCents(mine.amountCents)}
              </Button>
            ) : undefined
          }
        />
        <CommitmentRow label={counterpart.firstName} commitment={theirs} />
      </div>

      {protection.status === "committed" && (
        <>
          <Separator className="my-4" />
          <div className="rounded-xl bg-muted/50 p-3.5">
            <p className="text-sm font-medium text-foreground">
              Reconfirm your trip
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cutoff is {formatRelativeToNow(protection.reconfirmBy)} ({flight.flightNumber}
              {" "}departs {flight.departureTime}).
            </p>
            {!mine.reconfirmedAt ? (
              <Button size="sm" className="mt-3" onClick={handleReconfirm}>
                Reconfirm my trip
              </Button>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-teal-700">
                <CheckCircle2 className="size-4" />
                You&apos;ve reconfirmed. Waiting on {counterpart.firstName}.
              </p>
            )}
          </div>
        </>
      )}

      {protection.status === "reconfirmed" && (
        <>
          <Separator className="my-4" />
          <p className="flex items-center gap-1.5 text-sm text-teal-700">
            <CheckCircle2 className="size-4" />
            Both of you reconfirmed. You&apos;re all set.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleMarkCompleted}>
              Mark trip as completed
            </Button>
            <ReportNoShowDialog
              counterpartFirstName={counterpart.firstName}
              onSubmit={handleReportClaim}
            />
          </div>
        </>
      )}

      {protection.status === "cancelled_no_penalty" && (
        <>
          <Separator className="my-4" />
          <div className="rounded-xl bg-muted/50 p-3.5">
            <p className="text-sm font-medium text-foreground">
              No penalty applied
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {protection.cancellation?.reason === "airline_disruption"
                ? "Cancelled due to an airline disruption."
                : "Cancelled before the reconfirmation cutoff."}
            </p>
            <Link
              href={`/search?flight=${flight.flightNumber}`}
              className={cn(buttonVariants({ size: "sm" }), "mt-3")}
            >
              <RefreshCcw className="size-3.5" />
              Find a new match on this flight
            </Link>
          </div>
        </>
      )}

      {protection.status === "cancelled_late" && !protection.claim && (
        <>
          <Separator className="my-4" />
          <div className="rounded-xl bg-orange-50 p-3.5">
            <p className="text-sm font-medium text-orange-900">
              Late cancellation
            </p>
            <p className="mt-0.5 text-xs text-orange-800">
              {protection.cancellation?.byUserId === user.id
                ? `You cancelled after the cutoff. ${counterpart.firstName} can file a claim for your committed share.`
                : `${counterpart.firstName} cancelled after the cutoff. You can file a claim for your committed share.`}
            </p>
            {protection.cancellation?.byUserId !== user.id && (
              <div className="mt-3">
                <ReportNoShowDialog
                  counterpartFirstName={counterpart.firstName}
                  onSubmit={handleReportClaim}
                />
              </div>
            )}
          </div>
        </>
      )}

      {protection.status === "no_show_reported" && protection.claim && (
        <>
          <Separator className="my-4" />
          <ClaimPanel
            protection={protection}
            currentUserId={user.id}
            counterpartFirstName={counterpart.firstName}
            onResolve={handleResolve}
          />
        </>
      )}

      {(protection.status === "resolved_charged" ||
        protection.status === "resolved_waived") &&
        protection.claim && (
          <>
            <Separator className="my-4" />
            <ResolutionSummary
              protection={protection}
              currentUserId={user.id}
              counterpartFirstName={counterpart.firstName}
            />
          </>
        )}

      {protection.status === "completed" && (
        <>
          <Separator className="my-4" />
          <p className="flex items-center gap-1.5 text-sm text-teal-700">
            <CheckCircle2 className="size-4" />
            Trip completed — commitments released, nothing charged.
          </p>
        </>
      )}

      {canCancel && (
        <>
          <Separator className="my-4" />
          <CancelMatchDialog
            reconfirmBy={protection.reconfirmBy}
            onConfirm={handleCancel}
          />
        </>
      )}
    </div>
  );
}

function CommitmentRow({
  label,
  commitment,
  action,
}: {
  label: string;
  commitment: ProtectionCommitmentWithUser;
  action?: ReactNode;
}) {
  const STATUS_TEXT: Record<ProtectionCommitmentWithUser["status"], string> = {
    pending: "Not authorized yet",
    authorized: "Authorized",
    charged: "Charged",
    refunded: "Released",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
      <div className="flex items-center gap-2.5">
        <TravelerAvatar user={commitment.user} size="sm" />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {formatCents(commitment.amountCents)} ·{" "}
            {STATUS_TEXT[commitment.status]}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

function ClaimPanel({
  protection,
  currentUserId,
  counterpartFirstName,
  onResolve,
}: {
  protection: ProtectionWithDetails;
  currentUserId: string;
  counterpartFirstName: string;
  onResolve: (resolution: "approved" | "denied") => void;
}) {
  const claim = protection.claim!;
  const isAboutMe = claim.aboutUserId === currentUserId;

  return (
    <div className="rounded-xl bg-orange-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-orange-900">
          {isAboutMe
            ? `${counterpartFirstName} reported a no-show`
            : `Claim filed against ${counterpartFirstName}`}
        </p>
        <Badge variant="outline" className="border-orange-200 text-orange-700">
          Under review
        </Badge>
      </div>
      {claim.note && (
        <p className="mt-2 text-sm text-orange-800">&ldquo;{claim.note}&rdquo;</p>
      )}
      {claim.receiptFileName && (
        <p className="mt-1 text-xs text-orange-700">
          Receipt attached: {claim.receiptFileName}
        </p>
      )}
      <p className="mt-2 text-xs text-orange-700">
        Submitted {formatRelativeToNow(claim.submittedAt)}.
      </p>

      <Separator className="my-3 bg-orange-200" />
      <p className="text-xs text-muted-foreground">
        Demo only — in production this is a platform review, not a user
        action.
      </p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onResolve("denied")}>
          Simulate: waive
        </Button>
        <Button size="sm" onClick={() => onResolve("approved")}>
          <HandCoins className="size-3.5" />
          Simulate: approve charge
        </Button>
      </div>
    </div>
  );
}

function ResolutionSummary({
  protection,
  currentUserId,
  counterpartFirstName,
}: {
  protection: ProtectionWithDetails;
  currentUserId: string;
  counterpartFirstName: string;
}) {
  const claim = protection.claim!;
  const wasCharged = protection.status === "resolved_charged";
  const isAbsentParty = claim.aboutUserId === currentUserId;

  if (!wasCharged) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sparkles className="size-4" />
        Claim reviewed and waived — no charge applied, both commitments
        released.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-sm text-rose-700">
      <HandCoins className="size-4" />
      {isAbsentParty
        ? `Your committed share was charged and transferred to ${counterpartFirstName} as compensation.`
        : `${counterpartFirstName}'s committed share was charged and transferred to you as compensation.`}
    </p>
  );
}
