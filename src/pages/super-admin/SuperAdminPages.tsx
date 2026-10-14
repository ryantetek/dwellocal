import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
      hide_branding: patch.hide_branding ?? row.plan?.hide_branding ?? false,
    };
    const { error } = await supabase.from("user_plans").upsert(next);
    if (error) toast.error(error.message);
    else toast.success("Plan updated");
  }

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">User plans</h2>
      {rows.map((row) => (
        <form
          key={row.id}
          className="grid gap-3 rounded-[16px] border border-slate-200 bg-white p-4 md:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            void save(row, {
              plan: (data.get("plan") as "free" | "pro") ?? "free",
              property_limit: Number(data.get("property_limit")),
              hide_branding: data.get("hide_branding") === "on",
              plan_expires_at: (data.get("plan_expires_at") as string) || null,
            });
          }}
        >
          <div className="md:col-span-5 text-sm font-medium">{row.email}</div>
          <select name="plan" defaultValue={row.plan?.plan ?? "free"} className="h-10 rounded-[12px] border border-slate-200 px-2 text-sm">
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
          <Input name="property_limit" type="number" defaultValue={row.plan?.property_limit ?? 1} className="border-slate-200" />
          <Input name="plan_expires_at" type="datetime-local" defaultValue={row.plan?.plan_expires_at?.slice(0, 16) ?? ""} className="border-slate-200" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="hide_branding" defaultChecked={row.plan?.hide_branding} /> Hide branding
          </label>
          <Button type="submit" variant="slate" size="sm">
            Save
          </Button>
        </form>
      ))}
    </div>
  );
}

function MessagesPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AdminMessage[]>([]);
  const [reply, setReply] = useState("");
  const [target, setTarget] = useState<AdminMessage | null>(null);

  useEffect(() => {
    if (!supabase) return;
    void supabase
      .from("admin_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as AdminMessage[]) ?? []));
  }, []);

  async function send() {
    if (!supabase || !user || !target) return;
    const { error } = await supabase.from("admin_messages").insert({
      user_id: target.user_id,
      parent_id: target.id,
      category: target.category,
      subject: `Re: ${target.subject}`,
      body: reply,
      from_super_admin: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Reply sent");
      setReply("");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        {rows.map((row) => (
          <button
            type="button"
            key={row.id}
            onClick={() => setTarget(row)}
            className="w-full rounded-[12px] border border-slate-200 bg-white p-4 text-left"
          >
            <p className="text-sm font-medium">{row.subject}</p>
            <p className="text-xs text-slate-500">
              {row.category} · {row.from_super_admin ? "staff" : "host"}
            </p>
          </button>
        ))}
      </div>
      {target ? (
        <div className="rounded-[16px] border border-slate-200 bg-white p-5">
          <p className="font-heading font-semibold">{target.subject}</p>
          <p className="mt-3 text-sm">{target.body}</p>
          <Label className="mt-4">Reply</Label>
          <Textarea className="border-slate-200" value={reply} onChange={(e) => setReply(e.target.value)} />
          <Button variant="slate" className="mt-3" onClick={() => void send()}>
            Send
          </Button>
        </div>
      ) : null}
    </div>
  );
}
