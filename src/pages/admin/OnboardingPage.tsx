import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { createPropertyWithSeed } from "@/lib/seed";

export function OnboardingPage() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (plan.propertyLimit < 1) return;
    setBusy(true);
    try {
      await createPropertyWithSeed({ userId: user.id, name });
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create property");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-scope flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-[16px] border border-slate-200 bg-white p-8">
        <h1 className="font-heading text-2xl font-bold">Name your property</h1>
        <p className="mt-2 text-sm text-slate-500">We'll seed a starter page you can edit in CMS. Free plans include one property.</p>
        <div className="mt-6">
          <Label htmlFor="name">Property name</Label>
          <Input id="name" className="border-slate-200" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <Button type="submit" variant="slate" className="mt-6 w-full" disabled={busy}>
          {busy ? "Creating…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
