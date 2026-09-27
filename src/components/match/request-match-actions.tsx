"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CURRENT_USER_ID, requestMatch } from "@/lib/services";
import type { MatchStatus } from "@/types";

interface RequestMatchActionsProps {
  listingId: string;
  travelerFirstName: string;
  initialMatch?: { id: string; status: MatchStatus };
}

export function RequestMatchActions({
  listingId,
  travelerFirstName,
  initialMatch,
}: RequestMatchActionsProps) {
  const router = useRouter();
  const [match, setMatch] = useState(initialMatch);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestMatch() {
    setSubmitting(true);
    try {
      const created = await requestMatch(listingId, CURRENT_USER_ID);
      setMatch({ id: created.id, status: created.status });
      toast.success("Match requested!", {
        description: `${travelerFirstName} will be notified. You can message them now.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {match ? (
        <Button
          size="lg"
          variant="outline"
          disabled
          className="h-12 flex-1 border-teal-200 bg-teal-50 text-teal-700"
        >
          <CheckCircle2 className="size-4" />
          Match requested
        </Button>
      ) : (
        <Button
          size="lg"
          className="h-12 flex-1"
          onClick={handleRequestMatch}
          disabled={submitting}
        >
          <UserPlus className="size-4" />
          {submitting ? "Requesting..." : "Request Match"}
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        className="h-12 flex-1"
        disabled={!match}
        onClick={() => match && router.push(`/messages?match=${match.id}`)}
      >
        <MessageCircle className="size-4" />
        Message Traveler
      </Button>
    </div>
  );
}
