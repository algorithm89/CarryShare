import { describe, expect, it } from "vitest";
import {
  authorizeCommitment,
  cancelProtection,
  createProtectionForMatch,
  getProtectionByMatchId,
  markProtectionCompleted,
  reconfirmCommitment,
  reportNoShow,
  resolveClaim,
} from "@/data/protection";
import { getUserById } from "@/data/users";

// Every test creates its own protection with a unique matchId so tests don't
// interfere with each other or with the seeded demo data (p1/p2/p3).
let nextTestId = 0;
function uniqueMatchId() {
  return `test-match-${++nextTestId}`;
}

const FUTURE_CUTOFF = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // +24h
const PAST_CUTOFF = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // -1h

describe("createProtectionForMatch", () => {
  it("splits the total evenly between requester and responder", () => {
    const matchId = uniqueMatchId();
    const protection = createProtectionForMatch(
      matchId,
      "u1",
      "u2",
      6000,
      FUTURE_CUTOFF
    );

    expect(protection.status).toBe("awaiting_commitment");
    expect(protection.commitments).toHaveLength(2);
    expect(protection.commitments[0]).toMatchObject({
      userId: "u1",
      amountCents: 3000,
      status: "pending",
    });
    expect(protection.commitments[1]).toMatchObject({
      userId: "u2",
      amountCents: 3000,
      status: "pending",
    });
  });

  it("keeps the split summing to the total even when it doesn't divide evenly", () => {
    const matchId = uniqueMatchId();
    const protection = createProtectionForMatch(
      matchId,
      "u1",
      "u2",
      7001,
      FUTURE_CUTOFF
    );

    const sum = protection.commitments.reduce((a, c) => a + c.amountCents, 0);
    expect(sum).toBe(7001);
  });

  it("is retrievable afterwards by matchId", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u1", "u2", 4000, FUTURE_CUTOFF);
    expect(getProtectionByMatchId(matchId)?.matchId).toBe(matchId);
  });
});

describe("authorizeCommitment", () => {
  it("does not advance status until both sides authorize", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u1", "u2", 4000, FUTURE_CUTOFF);

    const afterFirst = authorizeCommitment(matchId, "u1");
    expect(afterFirst?.status).toBe("awaiting_commitment");
    expect(
      afterFirst?.commitments.find((c) => c.userId === "u1")?.status
    ).toBe("authorized");

    const afterSecond = authorizeCommitment(matchId, "u2");
    expect(afterSecond?.status).toBe("committed");
  });

  it("returns undefined for a match with no protection", () => {
    expect(authorizeCommitment("no-such-match", "u1")).toBeUndefined();
  });
});

describe("reconfirmCommitment", () => {
  it("only flips to reconfirmed once committed and both sides reconfirm", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u1", "u2", 4000, FUTURE_CUTOFF);

    // Reconfirming before both have authorized should not move status.
    reconfirmCommitment(matchId, "u1");
    expect(getProtectionByMatchId(matchId)?.status).toBe(
      "awaiting_commitment"
    );

    authorizeCommitment(matchId, "u1");
    authorizeCommitment(matchId, "u2");
    expect(getProtectionByMatchId(matchId)?.status).toBe("committed");

    reconfirmCommitment(matchId, "u1");
    expect(getProtectionByMatchId(matchId)?.status).toBe("committed");

    const afterBoth = reconfirmCommitment(matchId, "u2");
    expect(afterBoth?.status).toBe("reconfirmed");
  });
});

describe("cancelProtection", () => {
  it("applies no penalty when cancelled before the cutoff", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u1", "u2", 4000, FUTURE_CUTOFF);

    const protection = cancelProtection(matchId, "u1", "traveler_cancelled");
    expect(protection?.status).toBe("cancelled_no_penalty");
    expect(protection?.cancellation).toMatchObject({
      byUserId: "u1",
      reason: "traveler_cancelled",
    });
  });

  it("marks a late self-cancellation and records it against the user", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u6", "u1", 4000, PAST_CUTOFF);
    const before = getUserById("u6")!.lateCancellationCount;

    const protection = cancelProtection(matchId, "u6", "traveler_cancelled");

    expect(protection?.status).toBe("cancelled_late");
    expect(getUserById("u6")!.lateCancellationCount).toBe(before + 1);
  });

  it("never penalizes an airline disruption, even after the cutoff", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u6", "u1", 4000, PAST_CUTOFF);
    const before = getUserById("u6")!.lateCancellationCount;

    const protection = cancelProtection(matchId, "u6", "airline_disruption");

    expect(protection?.status).toBe("cancelled_no_penalty");
    expect(getUserById("u6")!.lateCancellationCount).toBe(before);
  });
});

describe("reportNoShow and resolveClaim", () => {
  function setUpReconfirmedProtection() {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u1", "u2", 4000, FUTURE_CUTOFF);
    authorizeCommitment(matchId, "u1");
    authorizeCommitment(matchId, "u2");
    reconfirmCommitment(matchId, "u1");
    reconfirmCommitment(matchId, "u2");
    return matchId;
  }

  it("filing a claim moves status to no_show_reported with the claim attached", () => {
    const matchId = setUpReconfirmedProtection();

    const protection = reportNoShow(matchId, "u1", "u2", "receipt.pdf", "Waited an hour");

    expect(protection?.status).toBe("no_show_reported");
    expect(protection?.claim).toMatchObject({
      reportedByUserId: "u1",
      aboutUserId: "u2",
      receiptFileName: "receipt.pdf",
      note: "Waited an hour",
      resolution: "pending",
    });
  });

  it("approving a claim charges the absent party and refunds the filer, and records the no-show", () => {
    const matchId = setUpReconfirmedProtection();
    reportNoShow(matchId, "u1", "u2");
    const before = getUserById("u2")!.noShowCount;

    const protection = resolveClaim(matchId, "approved");

    expect(protection?.status).toBe("resolved_charged");
    expect(
      protection?.commitments.find((c) => c.userId === "u2")?.status
    ).toBe("charged");
    expect(
      protection?.commitments.find((c) => c.userId === "u1")?.status
    ).toBe("refunded");
    expect(getUserById("u2")!.noShowCount).toBe(before + 1);
  });

  it("denying a claim refunds both sides and records no penalty", () => {
    const matchId = setUpReconfirmedProtection();
    reportNoShow(matchId, "u1", "u2");
    const before = getUserById("u2")!.noShowCount;

    const protection = resolveClaim(matchId, "denied");

    expect(protection?.status).toBe("resolved_waived");
    expect(protection?.commitments.every((c) => c.status === "refunded")).toBe(
      true
    );
    expect(getUserById("u2")!.noShowCount).toBe(before);
  });

  it("does nothing when resolving a match with no claim filed", () => {
    const matchId = setUpReconfirmedProtection();
    expect(resolveClaim(matchId, "approved")).toBeUndefined();
  });
});

describe("markProtectionCompleted", () => {
  it("releases both commitments with no charge", () => {
    const matchId = uniqueMatchId();
    createProtectionForMatch(matchId, "u1", "u2", 4000, FUTURE_CUTOFF);
    authorizeCommitment(matchId, "u1");
    authorizeCommitment(matchId, "u2");

    const protection = markProtectionCompleted(matchId);

    expect(protection?.status).toBe("completed");
    expect(protection?.commitments.every((c) => c.status === "refunded")).toBe(
      true
    );
  });
});
