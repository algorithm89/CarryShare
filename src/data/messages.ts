import type { Message } from "@/types";

export const messages: Message[] = [];

let nextMessageId = messages.length + 1;

export function getMessages(): Message[] {
  return messages;
}

export function getMessagesForMatch(matchId: string): Message[] {
  return messages
    .filter((message) => message.matchId === matchId)
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
}

export function sendMessage(
  matchId: string,
  senderId: string,
  text: string
): Message {
  const message: Message = {
    id: `msg${nextMessageId++}`,
    matchId,
    senderId,
    text,
    sentAt: new Date().toISOString(),
    read: false,
  };
  messages.push(message);
  return message;
}
