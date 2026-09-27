import { MessageSquareHeart, PlaneTakeoff, Users } from "lucide-react";

const STEPS = [
  {
    icon: PlaneTakeoff,
    title: "Find your flight",
    description: "Enter your flight number and departure date.",
  },
  {
    icon: Users,
    title: "Find travelers",
    description: "Discover CarryShare members traveling on the same flight.",
  },
  {
    icon: MessageSquareHeart,
    title: "Connect",
    description: "Message your match and organize the details together.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            How CarryShare works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three simple steps to find a travel companion for your extra
            luggage.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10"
            >
              <span className="absolute top-5 right-5 font-heading text-3xl font-semibold text-muted/80">
                {index + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <step.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
