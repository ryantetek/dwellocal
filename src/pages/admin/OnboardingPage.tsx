import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { createPropertyWithSeed } from "@/lib/seed";
import { RESERVED_SLUGS, slugify, slugifyLive } from "@/lib/utils";

export function OnboardingPage() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previewSlug = slugify(slug) || "your-address";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (plan.propertyLimit < 1) return;
    const webAddress = slugify(slug);
    if (!webAddress) {
      setError("Choose a web address for your property page.");
      return;
    }
    if (RESERVED_SLUGS.has(webAddress)) {
      setError("That web address is reserved. Please choose another.");
      return;
    }
    setBusy(true);
    try {
      await createPropertyWithSeed({ userId: user.id, name, slug: webAddress });
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
          <Input
            id="name"
            className="border-slate-200"
            value={name}
            placeholder="Sunset Beach Villa"
            onChange={(e) => {
              const next = e.target.value;
              setName(next);
              if (!slugEdited) setSlug(slugifyLive(next));
            }}
            required
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="slug">Web address</Label>
          <Input
            id="slug"
            className="border-slate-200"
            value={slug}
            placeholder="sunset-beach-villa"
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(slugifyLive(e.target.value));
            }}
            required
          />
          <p className="mt-2 text-sm text-slate-500">
            Your page will live at /{previewSlug}
          </p>
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <Button type="submit" variant="slate" className="mt-6 w-full" disabled={busy}>
          {busy ? "Creating…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
