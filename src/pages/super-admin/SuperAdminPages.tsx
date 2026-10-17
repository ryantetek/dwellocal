import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { SupportChat, ResolvedBadge } from "@/components/admin/SupportChat";
import { supabase } from "@/lib/supabase";
import { groupSupportByThread } from "@/lib/supportThread";
import { cn } from "@/lib/utils";
import type { AdminMessage, Profile, UserPlan } from "@/types/database";

type UserRow = Profile & { plan?: UserPlan | null };

export function SuperAdminLayout() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<"approvals" | "plans" | "messages">("approvals");
  return (
    <div className="admin-scope min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Platform</p>
          <h1 className="font-heading text-xl font-bold">Super Admin</h1>
        </div>
        <button type="button" className="text-sm text-slate-600" onClick={() => void signOut()}>
          Sign out
        </button>
      </header>
      <div className="flex gap-2 px-6 py-4">
        {(["approvals", "plans", "messages"] as const).map((id) => (
          <Button key={id} size="sm" variant={tab === id ? "slate" : "slate-outline"} onClick={() => setTab(id)}>
            {id}
          </Button>
        ))}
      </div>
      <div className="px-6 pb-12">
        <SuperAdminBody tab={tab} />
      </div>
    </div>
  );
}

function SuperAdminBody({ tab }: { tab: "approvals" | "plans" | "messages" }) {
  if (tab === "approvals") return <ApprovalsPanel />;
  if (tab === "plans") return <PlansPanel />;
  return <MessagesPanel />;
}

export function SuperAdminDashboard() {
  return <SuperAdminLayout />;
}

function ApprovalsPanel() {
  const [rows, setRows] = useState<Profile[]>([]);
  useEffect(() => {
    if (!supabase) return;
    void supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .then(({ data }) => setRows((data as Profile[]) ?? []));
  }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    if (!supabase) return;
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else setRows((list) => list.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">Pending signups</h2>
      {rows.length === 0 ? <p className="text-sm text-slate-500">No pending users.</p> : null}
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-white p-4">
          <div>
            <p className="font-medium">{row.email}</p>
            <p className="text-xs text-slate-500">{row.full_name}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="slate" onClick={() => void setStatus(row.id, "approved")}>
              Approve
            </Button>
            <Button size="sm" variant="slate-outline" onClick={() => void setStatus(row.id, "rejected")}>
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlansPanel() {
  const [rows, setRows] = useState<UserRow[]>([]);
  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: plans } = await supabase.from("user_plans").select("*");
      const planMap = new Map(((plans as UserPlan[]) ?? []).map((p) => [p.user_id, p]));
      setRows(((profiles as Profile[]) ?? []).map((p) => ({ ...p, plan: planMap.get(p.id) ?? null })));
    })();
  }, []);

  async function save(row: UserRow, patch: Partial<UserPlan>) {
    if (!supabase) return;
    const next = {
      user_id: row.id,
      plan: patch.plan ?? row.plan?.plan ?? "free",
      plan_expires_at: patch.plan_expires_at ?? row.plan?.plan_expires_at ?? null,
      property_limit: patch.property_limit ?? row.plan?.property_limit ?? 1,
      hide_branding: row.plan?.hide_branding ?? false,
    };
    const { error } = await supabase.from("user_plans").upsert(next);
    if (error) toast.error(error.message);
    else toast.success("Plan updated");
  }

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">User plans</h2>
      <p className="text-sm text-slate-500">
       - 
      </p>
      <div className="overflow-x-auto rounded-[16px] border border-slate-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Property limit</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">
                <span className="sr-only">Save</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-500">
                  No users yet.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const formId = `plan-${row.id}`;
              return (
                <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-medium">{row.email}</td>
                  <td className="px-4 py-3">
                    <select
                      form={formId}
                      name="plan"
                      defaultValue={row.plan?.plan ?? "free"}
                      className="h-10 w-full min-w-[6.5rem] rounded-[12px] border border-slate-200 px-2 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      form={formId}
                      name="property_limit"
                      type="number"
                      min={1}
                      defaultValue={row.plan?.property_limit ?? 1}
                      className="border-slate-200"
                      aria-label={`Property limit for ${row.email}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      form={formId}
                      name="plan_expires_at"
                      type="datetime-local"
                      defaultValue={row.plan?.plan_expires_at?.slice(0, 16) ?? ""}
                      className="border-slate-200"
                      aria-label={`Plan expiry for ${row.email}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <form
                      id={formId}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        void save(row, {
                          plan: (data.get("plan") as "free" | "pro") ?? "free",
                          property_limit: Number(data.get("property_limit")),
                          plan_expires_at: (data.get("plan_expires_at") as string) || null,
                        });
                      }}
                    >
                      <Button type="submit" variant="slate" size="sm">
                        Save
                      </Button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AdminMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const threads = useMemo(() => groupSupportByThread(rows), [rows]);
  const active = threads.find((t) => t.threadId === activeThreadId) ?? null;
  const activeProfile = active ? profiles[active.userId] : null;

  useEffect(() => {
    if (!supabase) return;
    void Promise.all([
      supabase.from("admin_messages").select("*").order("created_at", { ascending: true }),
      supabase.from("profiles").select("*"),
    ]).then(([messages, people]) => {
      const list = (messages.data as AdminMessage[]) ?? [];
      setRows(list);
      setProfiles(Object.fromEntries(((people.data as Profile[]) ?? []).map((p) => [p.id, p])));
      setActiveThreadId((current) => current ?? groupSupportByThread(list)[0]?.threadId ?? null);
    });
  }, []);

  useEffect(() => {
    if (!supabase || !activeThreadId) return;
    const unreadIds = rows
      .filter((m) => (m.thread_id || `user:${m.user_id}`) === activeThreadId && !m.from_super_admin && !m.is_read)
      .map((m) => m.id);
    if (!unreadIds.length) return;
    void supabase.from("admin_messages").update({ is_read: true }).in("id", unreadIds).then(({ error }) => {
      if (error) return;
      setRows((list) => list.map((m) => (unreadIds.includes(m.id) ? { ...m, is_read: true } : m)));
    });
  }, [activeThreadId, rows]);

  async function send() {
    if (!supabase || !user || !active) return;
    const body = reply.trim();
    if (!body) return toast.error("Write a reply first.");
    const lastHost = [...active.messages].reverse().find((m) => !m.from_super_admin);
    const last = active.messages[active.messages.length - 1];
    setBusy(true);
    const { data, error } = await supabase
      .from("admin_messages")
      .insert({
        user_id: active.userId,
        parent_id: last?.id ?? null,
        thread_id: active.threadId.startsWith("user:") ? last?.thread_id ?? null : active.threadId,
        category: lastHost?.category ?? last?.category ?? "general",
        subject: lastHost?.subject ? `Re: ${lastHost.subject.replace(/^Re:\s*/i, "")}` : "Reply",
        body,
        from_super_admin: true,
        is_read: true,
        resolved: false,
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setRows((list) => [
        ...list.map((m) =>
          (m.thread_id || `user:${m.user_id}`) === active.threadId ? { ...m, resolved: false } : m,
        ),
        data as AdminMessage,
      ]);
      setReply("");
    }
  }

  async function setResolved(next: boolean) {
    if (!supabase || !active) return;
    const ids = active.messages.map((m) => m.id);
    if (!ids.length) return;
    setBusy(true);
    const { error } = await supabase.from("admin_messages").update({ resolved: next }).in("id", ids);
    setBusy(false);
    if (error) toast.error(error.message);
    else setRows((list) => list.map((m) => (ids.includes(m.id) ? { ...m, resolved: next } : m)));
  }

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">Messages</h2>
      <p className="text-sm text-slate-500">Each host inquiry is its own conversation. Resolve one without closing later notes.</p>
      <div className="grid min-h-[32rem] overflow-hidden rounded-[16px] border border-slate-200 bg-white md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 md:border-b-0 md:border-r">
          {threads.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No host messages yet.</p>
          ) : (
            <ul className="max-h-[12rem] overflow-y-auto md:max-h-[32rem]">
              {threads.map((thread) => {
                const latest = thread.messages[thread.messages.length - 1];
                const person = profiles[thread.userId];
                const selected = thread.threadId === activeThreadId;
                return (
                  <li key={thread.threadId}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveThreadId(thread.threadId);
                        setReply("");
                      }}
                      className={cn(
                        "w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0",
                        thread.resolved
                          ? selected
                            ? "bg-emerald-100"
                            : "bg-emerald-50 hover:bg-emerald-100/80"
                          : thread.needsReply
                            ? selected
                              ? "bg-amber-200"
                              : "bg-amber-100 hover:bg-amber-200/80"
                            : selected
                              ? "bg-slate-100"
                              : "hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {thread.subject}
                        </p>
                        {thread.resolved ? (
                          <ResolvedBadge resolved />
                        ) : thread.needsReply ? (
                          <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                            Needs reply
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-slate-500">{person?.email || person?.full_name || "Host"}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{latest.body}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
        {active ? (
          <div className="flex min-h-[24rem] flex-col">
            <div
              className={cn(
                "flex items-start justify-between gap-3 border-b px-5 py-3",
                active.resolved
                  ? "border-emerald-200 bg-emerald-50"
                  : active.needsReply
                    ? "border-amber-200 bg-amber-100"
                    : "border-slate-200",
              )}
            >
              <div>
                <p className="font-heading font-semibold">{active.subject}</p>
                <p className="text-xs text-slate-500">{activeProfile?.email || activeProfile?.full_name || "Host"}</p>
              </div>
              <div className="flex items-center gap-2">
                {active.needsReply ? (
                  <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                    Needs reply
                  </span>
                ) : null}
                <ResolvedBadge resolved={active.resolved} />
                <Button
                  type="button"
                  size="sm"
                  variant={active.resolved ? "slate-outline" : "slate"}
                  disabled={busy || active.messages.length === 0}
                  onClick={() => void setResolved(!active.resolved)}
                >
                  {active.resolved ? "Reopen" : "Close / resolve"}
                </Button>
              </div>
            </div>
            <SupportChat
              messages={active.messages}
              resolved={active.resolved}
              staffOnRight
              hostLabel={activeProfile?.full_name || "Host"}
              staffLabel="You"
            />
            {active.resolved ? (
              <p className="border-t border-emerald-200 bg-emerald-50/50 px-5 py-4 text-sm text-emerald-800">
                Resolved. The host can open a new conversation with the Support form.
              </p>
            ) : (
              <div className="border-t border-slate-200 p-4">
                <Textarea
                  className="border-slate-200"
                  placeholder={`Reply to ${activeProfile?.full_name || activeProfile?.email || "this host"}…`}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button variant="slate" className="mt-3" disabled={busy} onClick={() => void send()}>
                  {busy ? "Sending…" : "Send reply"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-sm text-slate-500">Select a conversation.</div>
        )}
      </div>
    </div>
  );
}
