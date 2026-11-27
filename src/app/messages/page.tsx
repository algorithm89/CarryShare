import { MessagesClient } from "@/components/messages/messages-client";
import { requireUser } from "@/lib/session";

interface MessagesPageProps {
  searchParams: Promise<{ match?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { match } = await searchParams;
  // Chats are only for logged-in users; everyone else is sent to /login.
  await requireUser(match ? `/messages?match=${encodeURIComponent(match)}` : "/messages");

  return <MessagesClient initialMatchId={match} />;
}
