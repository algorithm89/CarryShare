"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { TravelerAvatar } from "@/components/shared/traveler-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMessageTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message, User } from "@/types";

interface MessageThreadProps {
  messages: Message[];
  currentUser: User;
  counterpart: User;
  onSend: (text: string) => void;
}

export function MessageThread({
  messages,
  currentUser,
  counterpart,
  onSend,
}: MessageThreadProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.map((message) => {
          const isMine = message.senderId === currentUser.id;
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2",
                isMine ? "justify-end" : "justify-start"
              )}
            >
              {!isMine && <TravelerAvatar user={counterpart} size="sm" />}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  isMine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    isMine
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {formatMessageTimestamp(message.sentAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3 sm:p-4"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${counterpart.firstName}...`}
          className="h-11 flex-1"
        />
        <Button type="submit" size="icon-lg" disabled={!draft.trim()}>
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
