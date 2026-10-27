import { AlertTriangle, Mail, Phone, ShieldCheck } from "lucide-react";
import { ProfileCard } from "@/components/profile/profile-card";
import { TrustBadge } from "@/components/shared/trust-badge";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/services";
import type { VerificationStatus } from "@/types";

export default async function ProfilePage() {
  const user = await getLoggedInUser();

  const verificationItems: {
    icon: typeof ShieldCheck;
    label: string;
    status: VerificationStatus;
  }[] = [
    { icon: ShieldCheck, label: "Identity verification", status: user.verification.identity },
    { icon: Mail, label: "Email verification", status: user.verification.email },
    { icon: Phone, label: "Phone verification", status: user.verification.phone },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <ProfileCard user={user} />

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          CarryShare Protection history
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Late cancellations and no-shows are tracked to help travelers trust
          their matches.
        </p>

        {user.lateCancellationCount === 0 && user.noShowCount === 0 ? (
          <p className="mt-3 text-sm text-teal-700">
            Clean record — no late cancellations or no-shows.
          </p>
        ) : (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-sm text-orange-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              {user.lateCancellationCount} late cancellation
              {user.lateCancellationCount === 1 ? "" : "s"} and{" "}
              {user.noShowCount} no-show{user.noShowCount === 1 ? "" : "s"} on
              record.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Verification
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified travelers build more trust in the CarryShare community.
        </p>

        <div className="mt-4 space-y-3">
          {verificationItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <item.icon className="size-4" />
                </span>
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TrustBadge status={item.status} />
                {item.status !== "verified" && (
                  <Button size="sm" variant="outline" disabled>
                    Verify
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Identity, phone, and email verification are coming soon.
        </p>
      </div>
    </div>
  );
}
