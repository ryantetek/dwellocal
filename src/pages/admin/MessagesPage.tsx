import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoHostName, demoMessages } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/database";

function groupThreads(rows: ChatMessage[]) {
  const map = new Map<string, ChatMessage[]>();
  const chronological = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const row of chronological) {
    const key = row.guest_email.toLowerCase();
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.values()].sort((a, b) => b[b.length - 1].created_at.localeCompare(a[a.length - 1].created_at));
}

export function MessagesPage() {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const [rows, setRows] = useState<ChatMessage[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const threads = useMemo(() => groupThreads(rows), [rows]);
  const hostLabel = isDemo ? demoHostName : "You";

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setRows(demoMessages);
      return;
    }
    if (!supabase) return;
    void supabase
      .from("chat_messages")
      .select("*")
      .eq("property_id", current.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as ChatMessage[]) ?? []));
  }, [current, isDemo]);

  async function reply(thread: ChatMessage[]) {
    const target = [...thread].reverse().find((m) => !m.admin_reply) ?? thread[thread.length - 1];
    if (!target) return;
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase) return;
    const admin_reply = drafts[target.guest_email] ?? drafts[target.id];
    if (!admin_reply?.trim()) return toast.error("Write a reply first.");
    const { error } = await supabase
      .from("chat_messages")
      .update({ admin_reply, is_read: true, replied_at: new Date().toISOString() })
      .eq("id", target.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Reply saved");
      setRows((list) => list.map((m) => (m.id === target.id ? { ...m, admin_reply, is_read: true } : m)));
      setDrafts((d) => ({ ...d, [target.guest_email]: "" }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">Guest enquiries and your replies, grouped as conversations.</p>
      </div>
      {threads.map((thread) => {
        const latest = thread[thread.length - 1];
        const unread = thread.some((m) => !m.is_read);
        const draftKey = latest.guest_email;
        return (
          <div key={draftKey} className="rounded-[16px] border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{latest.guest_name}</p>
                <p className="text-sm text-slate-500">{latest.guest_email}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                {unread ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Needs reply
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Replied
                  </span>
                )}
                <span>{new Date(latest.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {thread.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="max-w-[85%] rounded-[16px] rounded-tl-md bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">{msg.guest_name}</p>
                    <p className="mt-1 text-sm text-slate-800">{msg.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                  {msg.admin_reply ? (
                    <div className="ml-auto max-w-[85%] rounded-[16px] rounded-tr-md bg-slate-800 px-4 py-3 text-white">
                      <p className="text-xs font-medium text-slate-300">{hostLabel}</p>
                      <p className="mt-1 text-sm">{msg.admin_reply}</p>
                      {msg.replied_at ? (
                        <p className="mt-1 text-[11px] text-slate-400">{new Date(msg.replied_at).toLocaleString()}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <Textarea
              className="mt-4 border-slate-200"
              placeholder={`Reply to ${latest.guest_name}…`}
              value={drafts[draftKey] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [draftKey]: e.target.value }))}
            />
            <Button variant="slate" size="sm" className={cn("mt-3")} onClick={() => void reply(thread)}>
              Send reply
            </Button>
          </div>
        );
      })}
      {rows.length === 0 ? <p className="text-sm text-slate-500">No enquiries yet.</p> : null}
    </div>
  );
}
