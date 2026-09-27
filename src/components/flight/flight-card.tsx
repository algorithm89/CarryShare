import { PlaneTakeoff } from "lucide-react";
import { formatDateLong, formatDateMedium } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Flight } from "@/types";

interface FlightCardProps {
  flight: Flight;
  variant?: "detailed" | "compact";
  className?: string;
}

export function FlightCard({
  flight,
  variant = "detailed",
  className,
}: FlightCardProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <PlaneTakeoff className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {flight.originCode} &rarr; {flight.destinationCode}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {flight.flightNumber} &middot; {formatDateMedium(flight.departureDate)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br from-primary to-teal-800 p-5 text-primary-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tracking-wide">
          {flight.flightNumber}
        </span>
        <span className="text-xs text-primary-foreground/80">
          {flight.airline}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold">{flight.originCode}</p>
          <p className="text-sm text-primary-foreground/80">
            {flight.originCity}
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center px-2">
          <span className="text-xs text-primary-foreground/70">
            {flight.departureTime} &rarr; {flight.arrivalTime}
          </span>
          <div className="my-1.5 flex w-full items-center gap-1.5">
            <span className="h-px flex-1 bg-primary-foreground/30" />
            <PlaneTakeoff className="size-4 rotate-90" />
            <span className="h-px flex-1 bg-primary-foreground/30" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{flight.destinationCode}</p>
          <p className="text-sm text-primary-foreground/80">
            {flight.destinationCity}
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-primary-foreground/15 pt-3 text-sm text-primary-foreground/90">
        {formatDateLong(flight.departureDate)}
      </p>
    </div>
  );
}
