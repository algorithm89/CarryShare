import { BadgeCheck, MessagesSquare, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: BadgeCheck,
    title: "Verified travelers",
    description:
      "Members can verify their identity, email, and phone number to build trust in the community.",
  },
  {
    icon: MessagesSquare,
    title: "You stay in control",
    description:
      "Message your match directly and agree on the details before you commit to anything.",
  },
  {
    icon: ShieldCheck,
    title: "Your responsibility, your rules",
    description:
      "You review what you're carrying and confirm it complies with airline, customs, and destination rules.",
  },
];

export function TrustSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Built on trust between travelers
          </h2>
          <p className="mt-2 text-muted-foreground">
            CarryShare is a matching platform, not a shipping company &mdash;
            travelers coordinate and take responsibility for their own items.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {POINTS.map((point) => (
            <div key={point.title} className="text-center sm:text-left">
              <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-background text-primary ring-1 ring-border sm:mx-0">
                <point.icon className="size-5" />
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold text-foreground">
                {point.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
