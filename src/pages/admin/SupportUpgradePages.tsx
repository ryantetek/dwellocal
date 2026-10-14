import { useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { supabase } from "@/lib/supabase";

export function SupportPage() {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase || !user) return;
    const { error } = await supabase.from("admin_messages").insert({
      user_id: user.id,
      category,
      subject,
      body,
      from_super_admin: false,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Message sent to Super Admin");
      setSubject("");
      setBody("");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold">Support</h1>
      <p className="text-sm text-slate-500">
        {isDemo ? "Message Super Admin. Upgrade options appear after you create an account." : "Contact Super Admin or request an upgrade."}
      </p>
      <form onSubmit={send} className="mt-6 space-y-3 rounded-[16px] border border-slate-200 bg-white p-6">
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
          <Input className="border-slate-200" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea className="border-slate-200" value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <Button variant="slate">Send</Button>
      </form>
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
