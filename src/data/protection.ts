import { recordLateCancellation, recordNoShow } from "@/data/users";
import type {
  CancellationReason,
  ClaimResolution,
  Protection,
  ProtectionCommitment,
} from "@/types";

/**
 * CarryShare Protection: a mocked commitment-and-accountability layer
 * between two matched travelers. Nothing here moves real money —
 * "authorizing" and "charging" a commitment are UI states only, standing in
 * for the real Stripe + Supabase integration that comes later.
 */
export const protections: Protection[] = [
  // m1: Marco's listing, match still pending — protection setup hasn't started.
  {
    id: "p1",
    matchId: "m1",
    totalAmountCents: 7000,
    reconfirmBy: "2026-10-14T07:30:00Z",
    status: "awaiting_commitment",
    commitments: [
      { userId: "u1", amountCents: 3500, status: "pending" },
      { userId: "u4", amountCents: 3500, status: "pending" },
    ],
  },
  // m2: Sarah <-> Alex, accepted match on AC873 — both committed & reconfirmed.
  {
    id: "p2",
    matchId: "m2",
    totalAmountCents: 6000,
    reconfirmBy: "2026-10-14T07:30:00Z",
    status: "reconfirmed",
    commitments: [
      {
        userId: "u2",
        amountCents: 3000,
        status: "authorized",
        authorizedAt: "2026-09-13T09:45:00Z",
        reconfirmedAt: "2026-09-20T10:00:00Z",
      },
      {
        userId: "u1",
        amountCents: 3000,
        status: "authorized",
        authorizedAt: "2026-09-13T09:40:00Z",
        reconfirmedAt: "2026-09-20T09:55:00Z",
      },
    ],
  },
  // m3: completed past CarryShare — trip happened fine, deposits released.
  {
    id: "p3",
    matchId: "m3",
    totalAmountCents: 4500,
    reconfirmBy: "2026-08-02T17:10:00Z",
    status: "completed",
    commitments: [
      {
        userId: "u1",
        amountCents: 2250,
        status: "refunded",
        authorizedAt: "2026-07-20T09:30:00Z",
        reconfirmedAt: "2026-08-02T10:00:00Z",
      },
      {
        userId: "u2",
        amountCents: 2250,
        status: "refunded",
        authorizedAt: "2026-07-20T09:35:00Z",
        reconfirmedAt: "2026-08-02T10:05:00Z",
      },
    ],
  },
];

let nextProtectionId = protections.length + 1;

export function getProtections(): Protection[] {
  return protections;
}

export function getProtectionByMatchId(matchId: string): Protection | undefined {
  return protections.find((p) => p.matchId === matchId);
}

export function createProtectionForMatch(
  matchId: string,
  requesterId: string,
  responderId: string,
  totalAmountCents: number,
  reconfirmBy: string
): Protection {
  const half = Math.round(totalAmountCents / 2);
  const commitments: [ProtectionCommitment, ProtectionCommitment] = [
    { userId: requesterId, amountCents: half, status: "pending" },
    { userId: responderId, amountCents: totalAmountCents - half, status: "pending" },
  ];
  const protection: Protection = {
    id: `p${nextProtectionId++}`,
    matchId,
    totalAmountCents,
    reconfirmBy,
    status: "awaiting_commitment",
    commitments,
  };
  protections.push(protection);
  return protection;
}

export function authorizeCommitment(matchId: string, userId: string): Protection | undefined {
  const protection = getProtectionByMatchId(matchId);
  if (!protection) return undefined;
  const commitment = protection.commitments.find((c) => c.userId === userId);
  if (!commitment) return undefined;
  commitment.status = "authorized";
  commitment.authorizedAt = new Date().toISOString();
  if (protection.commitments.every((c) => c.status === "authorized")) {
    protection.status = "committed";
  }
  return protection;
}

export function reconfirmCommitment(matchId: string, userId: string): Protection | undefined {
  const protection = getProtectionByMatchId(matchId);
  if (!protection) return undefined;
  const commitment = protection.commitments.find((c) => c.userId === userId);
  if (!commitment) return undefined;
  commitment.reconfirmedAt = new Date().toISOString();
  if (
    protection.status === "committed" &&
    protection.commitments.every((c) => c.reconfirmedAt)
  ) {
    protection.status = "reconfirmed";
  }
  return protection;
}

export function cancelProtection(
  matchId: string,
  userId: string,
  reason: CancellationReason
): Protection | undefined {
  const protection = getProtectionByMatchId(matchId);
  if (!protection) return undefined;
  const now = new Date();
  const isLate = reason === "traveler_cancelled" && now > new Date(protection.reconfirmBy);
  protection.cancellation = { byUserId: userId, reason, at: now.toISOString() };
  protection.status = isLate ? "cancelled_late" : "cancelled_no_penalty";
  if (isLate) recordLateCancellation(userId);
  return protection;
}

export function reportNoShow(
  matchId: string,
  reportedByUserId: string,
  aboutUserId: string,
  receiptFileName?: string,
  note?: string
): Protection | undefined {
  const protection = getProtectionByMatchId(matchId);
  if (!protection) return undefined;
  protection.claim = {
    reportedByUserId,
    aboutUserId,
    submittedAt: new Date().toISOString(),
    receiptFileName,
    note,
    resolution: "pending",
  };
  protection.status = "no_show_reported";
  return protection;
}

export function resolveClaim(
  matchId: string,
  resolution: ClaimResolution
): Protection | undefined {
  const protection = getProtectionByMatchId(matchId);
  if (!protection || !protection.claim) return undefined;
  protection.claim.resolution = resolution;
  protection.claim.resolvedAt = new Date().toISOString();

  const absentCommitment = protection.commitments.find(
    (c) => c.userId === protection.claim!.aboutUserId
  );
  const filerCommitment = protection.commitments.find(
    (c) => c.userId === protection.claim!.reportedByUserId
  );

  if (resolution === "approved") {
    protection.status = "resolved_charged";
    if (absentCommitment) absentCommitment.status = "charged";
    if (filerCommitment) filerCommitment.status = "refunded";
    recordNoShow(protection.claim.aboutUserId);
  } else {
    protection.status = "resolved_waived";
    if (absentCommitment) absentCommitment.status = "refunded";
    if (filerCommitment) filerCommitment.status = "refunded";
  }
  return protection;
}

export function markProtectionCompleted(matchId: string): Protection | undefined {
  const protection = getProtectionByMatchId(matchId);
  if (!protection) return undefined;
  protection.status = "completed";
  protection.commitments.forEach((c) => {
    c.status = "refunded";
  });
  return protection;
}
