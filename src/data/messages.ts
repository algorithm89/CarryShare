import type { Message } from "@/types";

export const messages: Message[] = [
  // Match m2: Sarah (needs space) <-> Alex (you, has space) on AC873
  {
    id: "msg1",
    matchId: "m2",
    senderId: "u1",
    text: "Hi! Looks like we're both on AC873 on October 14.",
    sentAt: "2026-09-13T09:20:00Z",
    read: true,
  },
  {
    id: "msg2",
    matchId: "m2",
    senderId: "u2",
    text: "Yes! I have about 5 kg of purchases — mostly wine and a few souvenirs.",
    sentAt: "2026-09-13T09:24:00Z",
    read: true,
  },
  {
    id: "msg3",
    matchId: "m2",
    senderId: "u1",
    text: "Perfect. Let's work out the luggage details.",
    sentAt: "2026-09-13T09:25:00Z",
    read: true,
  },
  {
    id: "msg4",
    matchId: "m2",
    senderId: "u2",
    text: "Great, thank you! I'll pack it in a small duffel so it's easy to combine with your bag.",
    sentAt: "2026-09-13T09:31:00Z",
    read: true,
  },
  {
    id: "msg5",
    matchId: "m2",
    senderId: "u1",
    text: "Sounds good. Let's meet at the check-in counter around 11:00, two hours before departure.",
    sentAt: "2026-09-13T09:40:00Z",
    read: true,
  },
  {
    id: "msg6",
    matchId: "m2",
    senderId: "u2",
    text: "Perfect, see you then!",
    sentAt: "2026-09-13T09:42:00Z",
    read: false,
  },

  // Match m1: Alex (you) requesting to help Marco with space, awaiting reply
  {
    id: "msg7",
    matchId: "m1",
    senderId: "u1",
    text: "Hi Marco, I saw you're bringing home some ceramics on AC873 — I've got a bit of extra room if you'd like to split a bag.",
    sentAt: "2026-09-19T10:05:00Z",
    read: true,
  },

  // Match m3: completed CarryShare from a past trip
  {
    id: "msg8",
    matchId: "m3",
    senderId: "u2",
    text: "Thanks again for sharing your bag on the Buenos Aires flight — the Malbec made it home safely!",
    sentAt: "2026-08-03T18:00:00Z",
    read: true,
  },
  {
    id: "msg9",
    matchId: "m3",
    senderId: "u1",
    text: "Any time! Safe travels.",
    sentAt: "2026-08-03T18:05:00Z",
    read: true,
  },
];

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
