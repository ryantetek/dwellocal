import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ResolvedBadge, SupportChat } from "@/components/admin/SupportChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoSupportMessages } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import { groupSupportByThread, newThreadId } from "@/lib/supportThread";
import { cn } from "@/lib/utils";
import type { AdminMessage } from "@/types/database";

export function SupportPage() {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [rows, setRows] = useState<AdminMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [busy, setBusy] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const threads = useMemo(() => groupSupportByThread(rows), [rows]);

  useEffect(() => {
    if (isDemo) {
      setRows(demoSupportMessages);
      return;
    }
    if (!supabase || !user) return;
    void supabase
      .from("admin_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setRows((data as AdminMessage[]) ?? []));
  }, [isDemo, user]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase || !user) return;
    const text = body.trim();
    if (!text) return toast.error("Write a message first.");
    const nextSubject = subject.trim();
    if (!nextSubject) return toast.error("Add a subject.");
    setBusy(true);
    const { data, error } = await supabase
      .from("admin_messages")
      .insert({
        user_id: user.id,
        parent_id: null,
        thread_id: newThreadId(),
        category,
        subject: nextSubject,
        body: text,
        from_super_admin: false,
        resolved: false,
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setRows((list) => [...list, data as AdminMessage]);
      setBody("");
      setSubject("");
    }
  }

  async function replyToThread(threadId: string) {
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase || !user) return;
    const thread = threads.find((t) => t.threadId === threadId);
    if (!thread || thread.resolved) return;
    const text = (replyDrafts[threadId] ?? "").trim();
    if (!text) return toast.error("Write a reply first.");
    const last = thread.messages[thread.messages.length - 1];
    setBusy(true);
    const { data, error } = await supabase
      .from("admin_messages")
      .insert({
        user_id: user.id,
        parent_id: last?.id ?? null,
        thread_id: thread.threadId.startsWith("user:") ? last?.thread_id ?? newThreadId() : thread.threadId,
        category: last?.category ?? "general",
        subject: thread.subject,
        body: text,
        from_super_admin: false,
        resolved: false,
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setRows((list) => [...list, data as AdminMessage]);
      setReplyDrafts((d) => ({ ...d, [threadId]: "" }));
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] w-full flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Support</h1>
        <p className="text-sm text-slate-500">
          {isDemo
            ? "Message Super Admin. Upgrade options appear after you create an account."
            : "Use the form to start a new conversation. If Super Admin has resolved a thread, the next send opens a new one."}
        </p>
      </div>
      <form onSubmit={send} className="w-full space-y-4 rounded-[16px] border border-slate-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Category</Label>
            <select
              className="h-11 w-full rounded-[12px] border border-slate-200 px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General</option>
              {isDemo ? null : <option value="upgrade">Upgrade request</option>}
              {isDemo ? null : <option value="billing">Plan / billing</option>}
              <option value="bug">Something broken</option>
            </select>
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              className="border-slate-200"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label>Message</Label>
          <Textarea
            className="min-h-32 border-slate-200"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <Button variant="slate" disabled={busy}>
          {busy ? "Sending…" : "Send"}
        </Button>
      </form>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Conversations</h2>
        {threads.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200 bg-white px-5 py-10 text-sm text-slate-500">
            No messages yet. Send a note above to start a conversation.
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.threadId}
              className={cn(
                "flex min-h-[16rem] flex-col overflow-hidden rounded-[16px] border bg-white",
                thread.resolved ? "border-emerald-300" : "border-slate-200",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-b px-5 py-3",
                  thread.resolved ? "border-emerald-200 bg-emerald-50" : "border-slate-200",
                )}
              >
                <div>
                  <p className="font-heading font-semibold">{thread.subject}</p>
                  <p className="text-xs text-slate-500">
                    {thread.resolved ? "Resolved. Send a new form inquiry to start another conversation." : "Open conversation"}
                  </p>
                </div>
                <ResolvedBadge resolved={thread.resolved} />
              </div>
              <SupportChat
                messages={thread.messages}
                resolved={thread.resolved}
                staffOnRight={false}
                hostLabel="You"
                staffLabel="Super Admin"
                className="min-h-[12rem]"
              />
              {thread.resolved ? null : (
                <div className="border-t border-slate-200 p-4">
                  <Textarea
                    className="border-slate-200"
                    placeholder="Reply in this conversation…"
                    value={replyDrafts[thread.threadId] ?? ""}
                    onChange={(e) => setReplyDrafts((d) => ({ ...d, [thread.threadId]: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="slate"
                    className="mt-3"
                    disabled={busy}
                    onClick={() => void replyToThread(thread.threadId)}
                  >
                    Send reply
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function UpgradePage() {
  const { isDemo } = useDemo();
  if (isDemo) return <Navigate to="/demo/admin" replace />;
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Upgrade to Pro</h1>
      <p className="mt-2 text-slate-600">
        Manual accounting only — there is no payment processing in the product. Ask Super Admin to flip your plan.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        <li>Up to 20 gallery items and more properties</li>
        <li>All templates, including Editorial, Luxe, Nordic, Heritage, Tropic</li>
        <li>Custom header/footer scripts, GA4 and GTM</li>
        <li>Hide “Powered by Dwellocal”</li>
      </ul>
      <Button asChild variant="slate" className="mt-6">
        <a href="/admin/support">Request upgrade</a>
      </Button>
    </div>
  );
}
