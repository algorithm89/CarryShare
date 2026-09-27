"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  PackagePlus,
  PackageSearch,
  PlaneTakeoff,
  Sparkles,
} from "lucide-react";
import { FlightCard } from "@/components/flight/flight-card";
import { ListingCard } from "@/components/listing/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flights } from "@/data/flights";
import { getCurrentUser } from "@/data/users";
import { CURRENT_USER_ID, createListing } from "@/lib/services";
import { formatDateLong } from "@/lib/format";
import { ITEM_CATEGORY_LABELS, type ItemCategory, type ListingType } from "@/types";

const CATEGORY_OPTIONS = Object.entries(ITEM_CATEGORY_LABELS) as [
  ItemCategory,
  string
][];

const STEPS = ["Flight", "Type", "Details", "Preview"] as const;

export default function CreateListingPage() {
  const router = useRouter();
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [step, setStep] = useState(0);
  const [flightId, setFlightId] = useState<string>("");
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [weight, setWeight] = useState("");
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);

  const selectedFlight = flights.find((flight) => flight.id === flightId);
  const weightNumber = Number(weight);
  const needsSpace = listingType === "needs_space";

  const canContinue = [
    Boolean(flightId),
    Boolean(listingType),
    Boolean(weight) && weightNumber > 0,
    true,
  ][step];

  function toggleCategory(category: ItemCategory) {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  async function handlePublish() {
    if (!selectedFlight || !listingType) return;
    setPublishing(true);
    try {
      await createListing({
        userId: CURRENT_USER_ID,
        flightId: selectedFlight.id,
        type: listingType,
        categories: needsSpace ? categories : [],
        approxWeightKg: weightNumber,
        description: description.trim() || undefined,
      });
      toast.success("Listing published!", {
        description: "Other travelers on this flight can now see it.",
      });
      router.push("/trips");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Create a listing
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell fellow travelers what you need — it only takes a minute.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        <span className="shrink-0 text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 sm:p-6">
        {step === 0 && (
          <div>
            <StepHeading
              icon={PlaneTakeoff}
              title="What flight are you taking?"
              description="Select your flight so other travelers on board can find you."
            />
            <div className="mt-4 space-y-2">
              <Label htmlFor="flight-select">Flight</Label>
              <Select
                value={flightId}
                onValueChange={(value) => setFlightId(value ?? "")}
              >
                <SelectTrigger id="flight-select" className="h-11 w-full">
                  <SelectValue placeholder="Choose a flight">
                    {(value: string) => {
                      const flight = flights.find((f) => f.id === value);
                      if (!flight) return "Choose a flight";
                      return `${flight.flightNumber} · ${flight.originCity} (${flight.originCode}) → ${flight.destinationCity} (${flight.destinationCode}) · ${formatDateLong(flight.departureDate)}`;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {flights.map((flight) => (
                    <SelectItem key={flight.id} value={flight.id}>
                      {flight.flightNumber} &middot; {flight.originCity} (
                      {flight.originCode}) &rarr; {flight.destinationCity} (
                      {flight.destinationCode}) &middot;{" "}
                      {formatDateLong(flight.departureDate)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedFlight && (
              <FlightCard flight={selectedFlight} className="mt-4" />
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <StepHeading
              icon={Sparkles}
              title="What are you looking for?"
              description="Choose whether you need extra room, or have room to share."
            />
            <RadioGroup
              value={listingType}
              onValueChange={(value) => setListingType(value as ListingType)}
              className="mt-4"
            >
              <label
                htmlFor="needs_space"
                className={optionCardClass(listingType === "needs_space")}
              >
                <RadioGroupItem value="needs_space" id="needs_space" />
                <span className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <PackageSearch className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    I need luggage space
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    I have extra items and need room in someone else&apos;s bag.
                  </span>
                </span>
              </label>

              <label
                htmlFor="has_space"
                className={optionCardClass(listingType === "has_space")}
              >
                <RadioGroupItem value="has_space" id="has_space" />
                <span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <PackagePlus className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    I&apos;m willing to share luggage
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    I have spare room in my checked bag to share.
                  </span>
                </span>
              </label>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeading
              icon={needsSpace ? PackageSearch : PackagePlus}
              title={
                needsSpace
                  ? "What do you need to bring?"
                  : "How much space can you share?"
              }
              description="This helps travelers understand what to expect."
            />

            <div className="mt-4 space-y-2">
              <Label htmlFor="weight">
                {needsSpace ? "Approximate weight (kg)" : "Available weight (kg)"}
              </Label>
              <Input
                id="weight"
                type="number"
                min={1}
                max={32}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 5"
                className="h-11"
              />
            </div>

            {needsSpace && (
              <div className="mt-5 space-y-2">
                <Label>Item categories</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <label
                      key={value}
                      htmlFor={`category-${value}`}
                      className="group flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm has-data-checked:border-primary has-data-checked:bg-accent"
                    >
                      <Checkbox
                        id={`category-${value}`}
                        checked={categories.includes(value)}
                        onCheckedChange={() => toggleCategory(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  needsSpace
                    ? "e.g. 2 bottles of wine and a few souvenirs"
                    : "e.g. Traveling with just a carry-on, happy to help"
                }
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && selectedFlight && listingType && (
          <div>
            <StepHeading
              icon={Sparkles}
              title="Preview your listing"
              description="Here's what other travelers on this flight will see."
            />
            <div className="mt-4">
              <ListingCard
                listing={{
                  id: "preview",
                  userId: currentUser.id,
                  flightId: selectedFlight.id,
                  type: listingType,
                  categories: needsSpace ? categories : [],
                  approxWeightKg: weightNumber || 0,
                  description: description.trim() || undefined,
                  status: "active",
                  createdAt: new Date().toISOString(),
                  traveler: currentUser,
                }}
              />
            </div>
            <Badge variant="outline" className="mt-4 text-muted-foreground">
              This is only a preview — nothing is posted yet.
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="h-11"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canContinue}
            className="h-11"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="h-11"
          >
            {publishing ? "Publishing..." : "Publish listing"}
          </Button>
        )}
      </div>
    </div>
  );
}

function StepHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof PlaneTakeoff;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function optionCardClass(active: boolean) {
  return [
    "mb-3 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors last:mb-0",
    active ? "border-primary bg-accent" : "border-input hover:bg-muted/60",
  ].join(" ");
}
