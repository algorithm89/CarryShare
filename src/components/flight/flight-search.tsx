"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FlightSearchProps {
  className?: string;
}

export function FlightSearch({ className }: FlightSearchProps) {
  const router = useRouter();
  const formId = useId();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (origin.trim()) params.set("from", origin.trim());
    if (destination.trim()) params.set("to", destination.trim());
    if (flightNumber.trim()) params.set("flight", flightNumber.trim());
    if (date.trim()) params.set("date", date.trim());
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={cn(
        "w-full rounded-2xl bg-card p-4 shadow-lg ring-1 ring-foreground/10 sm:p-5",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr]">
        <Field label="From" htmlFor={`${formId}-from`}>
          <Input
            id={`${formId}-from`}
            placeholder="City or airport"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="h-11"
          />
        </Field>

        <div className="hidden items-end justify-center pb-2.5 lg:flex">
          <ArrowRightLeft className="size-4 text-muted-foreground" />
        </div>

        <Field label="To" htmlFor={`${formId}-to`}>
          <Input
            id={`${formId}-to`}
            placeholder="City or airport"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="h-11"
          />
        </Field>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Flight number" htmlFor={`${formId}-flight`}>
          <Input
            id={`${formId}-flight`}
            placeholder="e.g. AC873"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            className="h-11"
          />
        </Field>

        <Field label="Departure date" htmlFor={`${formId}-date`}>
          <Input
            id={`${formId}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11"
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-4 h-12 w-full text-base">
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
