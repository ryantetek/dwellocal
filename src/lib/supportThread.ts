import type { AdminMessage } from "@/types/database";

export type SupportThread = {
  threadId: string;
  userId: string;
  messages: AdminMessage[];
  resolved: boolean;
  needsReply: boolean;
  subject: string;
};

export function sortSupportMessages(rows: AdminMessage[]) {
  return [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function threadKey(message: AdminMessage) {
  return message.thread_id || `user:${message.user_id}`;
}

export function isThreadResolved(messages: AdminMessage[]) {
  return messages.length > 0 && messages.every((m) => m.resolved);
}

export function groupSupportByThread(rows: AdminMessage[]): SupportThread[] {
  const map = new Map<string, AdminMessage[]>();
  for (const row of sortSupportMessages(rows)) {
    const key = threadKey(row);
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.entries()]
    .map(([threadId, messages]) => {
      const resolved = isThreadResolved(messages);
      const last = messages[messages.length - 1];
      return {
        threadId,
        userId: messages[0].user_id,
        messages,
        resolved,
        needsReply: !resolved && Boolean(last && !last.from_super_admin),
        subject: messages.find((m) => !m.from_super_admin)?.subject || messages[0].subject || "Support",
      };
    })
    .sort((a, b) => {
      if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1;
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
      const aLast = a.messages[a.messages.length - 1]?.created_at ?? "";
      const bLast = b.messages[b.messages.length - 1]?.created_at ?? "";
      return bLast.localeCompare(aLast);
    });
}

export function newThreadId() {
  return crypto.randomUUID();
}
