import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoMessages } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/types/database";

export function MessagesPage() {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const [rows, setRows] = useState<ChatMessage[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

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

  async function reply(id: string) {
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase) return;
    const admin_reply = drafts[id];
    const { error } = await supabase
      .from("chat_messages")
      .update({ admin_reply, is_read: true, replied_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Reply saved");
      setRows((list) => list.map((m) => (m.id === id ? { ...m, admin_reply, is_read: true } : m)));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Messages</h1>
      {rows.map((msg) => (
        <div key={msg.id} className="rounded-[16px] border border-slate-200 bg-white p-5">
          <div className="flex justify-between text-sm">
            <p className="font-medium">
              {msg.guest_name} · {msg.guest_email}
            </p>
            <p className="text-slate-400">{new Date(msg.created_at).toLocaleString()}</p>
          </div>
          <p className="mt-3 text-sm">{msg.message}</p>
          {msg.admin_reply ? <p className="mt-3 rounded-[12px] bg-slate-50 p-3 text-sm">Reply: {msg.admin_reply}</p> : null}
          <Textarea
            className="mt-3 border-slate-200"
            value={drafts[msg.id] ?? msg.admin_reply ?? ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [msg.id]: e.target.value }))}
          />
          <Button variant="slate" size="sm" className="mt-3" onClick={() => void reply(msg.id)}>
            Send reply
          </Button>
        </div>
      ))}
      {rows.length === 0 ? <p className="text-sm text-slate-500">No enquiries yet.</p> : null}
    </div>
  );
}
