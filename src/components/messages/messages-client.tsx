"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircleOff } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { MessageThread } from "@/components/messages/message-thread";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getLoggedInUser,
  getMatchesForCurrentUser,
  getMessages,
  sendMessage,
} from "@/lib/services";
import type { MatchWithDetails } from "@/lib/services";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message, User } from "@/types";

interface ConversationSummary extends MatchWithDetails {
  lastMessage?: Message;
}

interface MessagesClientProps {
  initialMatchId?: string;
}

export function MessagesClient({ initialMatchId }: MessagesClientProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<
    ConversationSummary[] | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialMatchId
  );
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(
    Boolean(initialMatchId)
  );
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLoggedInUser(), getMatchesForCurrentUser()]).then(
      async ([user, matches]) => {
        const withLastMessage = await Promise.all(
          matches.map(async (m) => {
            const msgs = await getMessages(m.id);
            return { ...m, lastMessage: msgs.at(-1) };
          })
        );
        withLastMessage.sort((a, b) => {
          const aTime = a.lastMessage
            ? new Date(a.lastMessage.sentAt).getTime()
            : 0;
          const bTime = b.lastMessage
            ? new Date(b.lastMessage.sentAt).getTime()
            : 0;
          return bTime - aTime;
        });
        if (cancelled) return;
        setCurrentUser(user);
        setConversations(withLastMessage);
        setSelectedId((current) =>
          withLastMessage.some((c) => c.id === current)
            ? current
            : withLastMessage[0]?.id
        );
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = conversations?.find((c) => c.id === selectedId);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    getMessages(selectedId).then((result) => {
      if (!cancelled) setThreadMessages(result);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (!currentUser || !conversations) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-[70vh] w-full rounded-2xl" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={MessageCircleOff}
          title="No conversations yet"
          description="Request a match with a traveler to start coordinating your CarryShare."
        />
      </div>
    );
  }

  async function handleSend(text: string) {
    if (!selectedId || !currentUser) return;
    const message = await sendMessage(selectedId, currentUser.id, text);
    setThreadMessages((prev) => [...prev, message]);
    setConversations(
      (prev) =>
        prev?.map((c) =>
          c.id === selectedId ? { ...c, lastMessage: message } : c
        ) ?? prev
    );
  }

  return (
    <div className="mx-auto grid h-[calc(100dvh-9rem)] max-w-6xl grid-cols-1 md:h-[calc(100dvh-4rem)] md:grid-cols-[320px_1fr] md:px-6 md:py-6 lg:px-8">
      <aside
        className={cn(
          "min-h-0 overflow-y-auto border-border md:rounded-2xl md:border md:shadow-sm",
          showThreadOnMobile && "hidden md:block"
        )}
      >
        <div className="border-b border-border px-4 py-3">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Messages
          </h1>
        </div>
        <ul>
          {conversations.map((conversation) => {
            const unread =
              conversation.lastMessage &&
              !conversation.lastMessage.read &&
              conversation.lastMessage.senderId !== currentUser.id;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(conversation.id);
                    setShowThreadOnMobile(true);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                    conversation.id === selectedId && "bg-accent"
                  )}
                >
                  <TravelerAvatar user={conversation.counterpart} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {fullName(conversation.counterpart)}
                      </p>
                      {unread && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.lastMessage?.text ?? "No messages yet"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                      {conversation.flight.flightNumber} &middot;{" "}
                      {conversation.flight.originCode} &rarr;{" "}
                      {conversation.flight.destinationCode}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        className={cn(
          "flex min-h-0 flex-col md:rounded-2xl md:border md:border-border md:shadow-sm",
          !showThreadOnMobile && "hidden md:flex"
        )}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button
                type="button"
                className="md:hidden"
                onClick={() => setShowThreadOnMobile(false)}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="size-5 text-muted-foreground" />
              </button>
              <TravelerAvatar user={selected.counterpart} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {fullName(selected.counterpart)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {selected.flight.flightNumber} &middot;{" "}
                  {selected.flight.originCode} &rarr;{" "}
                  {selected.flight.destinationCode}
                </p>
              </div>
            </div>
            <MessageThread
              messages={threadMessages}
              currentUser={currentUser}
              counterpart={selected.counterpart}
              onSend={handleSend}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
