"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDateTimeMedium } from "@/lib/format";
import type { CancellationReason } from "@/types";

interface CancelMatchDialogProps {
  reconfirmBy: string;
  onConfirm: (reason: CancellationReason) => void | Promise<void>;
}

export function CancelMatchDialog({
  reconfirmBy,
  onConfirm,
}: CancelMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CancellationReason>("traveler_cancelled");
  const [submitting, setSubmitting] = useState(false);

  const isPastCutoff = new Date() > new Date(reconfirmBy);
  const wouldBeLate = reason === "traveler_cancelled" && isPastCutoff;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm(reason);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" />
        }
      >
        Cancel my match
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this CarryShare?</DialogTitle>
          <DialogDescription>
            Reconfirmation cutoff is {formatDateTimeMedium(reconfirmBy)}.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={reason}
          onValueChange={(value) => setReason(value as CancellationReason)}
        >
          <label
            htmlFor="reason-traveler"
            className="flex items-start gap-3 rounded-xl border border-input p-3 has-data-checked:border-primary has-data-checked:bg-accent"
          >
            <RadioGroupItem value="traveler_cancelled" id="reason-traveler" className="mt-0.5" />
            <span>
              <span className="block text-sm font-medium text-foreground">
                I need to cancel
              </span>
              <span className="block text-xs text-muted-foreground">
                No penalty before the cutoff. After the cutoff, this counts as
                a late cancellation.
              </span>
            </span>
          </label>

          <label
            htmlFor="reason-disruption"
            className="flex items-start gap-3 rounded-xl border border-input p-3 has-data-checked:border-primary has-data-checked:bg-accent"
          >
            <RadioGroupItem value="airline_disruption" id="reason-disruption" className="mt-0.5" />
            <span>
              <span className="block text-sm font-medium text-foreground">
                My flight was cancelled or disrupted by the airline
              </span>
              <span className="block text-xs text-muted-foreground">
                No penalty, regardless of timing.
              </span>
            </span>
          </label>
        </RadioGroup>

        {wouldBeLate && (
          <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              You&apos;re past the reconfirmation cutoff. Your counterpart will
              be able to file a claim for your committed share.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep my match
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Cancelling..." : "Confirm cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
