import { MessagesClient } from "@/components/messages/messages-client";

interface MessagesPageProps {
  searchParams: Promise<{ match?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { match } = await searchParams;

  return <MessagesClient initialMatchId={match} />;
}
