"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { FlightCard } from "@/components/flight/flight-card";
import { ListingCard } from "@/components/listing/listing-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENT_USER_ID, getListingsForFlightWithTravelers } from "@/lib/services";
import type { ListingWithTraveler } from "@/lib/services";
import { cn } from "@/lib/utils";
import { ITEM_CATEGORY_LABELS, type Flight, type ItemCategory } from "@/types";

interface SearchResultsProps {
  flights: Flight[];
  initialFlightId: string;
}

type TypeFilter = "all" | "needs_space" | "has_space";

const WEIGHT_OPTIONS = [
  { value: "any", label: "Any weight" },
  { value: "5", label: "Up to 5 kg" },
  { value: "10", label: "Up to 10 kg" },
  { value: "15", label: "Up to 15 kg" },
];

export function SearchResults({ flights, initialFlightId }: SearchResultsProps) {
  const [selectedFlightId, setSelectedFlightId] = useState(initialFlightId);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | "all">(
    "all"
  );
  const [weightFilter, setWeightFilter] = useState("any");
  const [results, setResults] = useState<{
    key: string;
    listings: ListingWithTraveler[];
  }>({ key: "", listings: [] });

  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) ?? flights[0],
    [flights, selectedFlightId]
  );

  const queryKey = `${selectedFlight.id}|${typeFilter}|${categoryFilter}|${weightFilter}`;
  const loading = results.key !== queryKey;
  const listings = results.listings;

  useEffect(() => {
    let cancelled = false;
    getListingsForFlightWithTravelers(selectedFlight.id, {
      type: typeFilter === "all" ? undefined : typeFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      maxWeightKg: weightFilter === "any" ? undefined : Number(weightFilter),
    }).then((result) => {
      if (!cancelled) {
        setResults({
          key: queryKey,
          listings: result.filter((listing) => listing.userId !== CURRENT_USER_ID),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedFlight.id, typeFilter, categoryFilter, weightFilter, queryKey]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {flights.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {flights.map((flight) => (
            <button
              key={flight.id}
              type="button"
              onClick={() => setSelectedFlightId(flight.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                flight.id === selectedFlight.id
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-background text-muted-foreground ring-border hover:bg-muted"
              )}
            >
              {flight.flightNumber} &middot; {flight.originCode}
              {"→"}
              {flight.destinationCode}
            </button>
          ))}
        </div>
      )}

      <FlightCard flight={selectedFlight} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as TypeFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="needs_space">Needs Space</TabsTrigger>
            <TabsTrigger value="has_space">Has Space</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              setCategoryFilter(value as ItemCategory | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category">
                {(value: string) =>
                  value === "all" || !value
                    ? "All categories"
                    : ITEM_CATEGORY_LABELS[value as ItemCategory]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={weightFilter}
            onValueChange={(value) => setWeightFilter(value ?? "any")}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Weight">
                {(value: string) =>
                  WEIGHT_OPTIONS.find((option) => option.value === value)
                    ?.label ?? "Any weight"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WEIGHT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        {!loading && (
          <Badge variant="outline">{listings.length} listing{listings.length === 1 ? "" : "s"}</Badge>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        ) : listings.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No matching listings yet"
            description="Try adjusting your filters, or check back later — travelers add listings as their departure date gets closer."
          />
        ) : (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </div>
    </div>
  );
}
