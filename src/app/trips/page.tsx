import { TripsClient } from "@/components/trips/trips-client";
import { requireUser } from "@/lib/session";

export default async function TripsPage() {
  await requireUser("/trips");
  return <TripsClient />;
}
