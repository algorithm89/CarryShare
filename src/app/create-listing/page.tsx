import { CreateListingForm } from "@/components/listing/create-listing-form";
import { requireUser } from "@/lib/session";

export default async function CreateListingPage() {
  const user = await requireUser("/create-listing");
  return <CreateListingForm currentUser={user} />;
}
