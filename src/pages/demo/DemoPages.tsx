import { Link } from "react-router-dom";
import { TemplateRenderer } from "@/components/property/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { demoBundle } from "@/data/demo";
import { KeyRound, Wifi } from "lucide-react";

export function DemoLandingPage() {
  return (
    <div className="min-h-screen bg-dwell-beige px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <DwellocalLogo showTagline />
        <p className="mt-8 text-sm uppercase tracking-[0.18em] text-dwell-muted">Read-only demo</p>
        <h1 className="mt-2 font-heading text-4xl font-bold">Explore Dwellocal without an account</h1>
        <p className="mt-4 text-dwell-muted">
          Sample public page, host dashboard, and guest guide. Editing is disabled everywhere.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/demo/property">Public showcase</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/demo/admin">Host dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/demo/guide">Guest guide</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DemoPropertyPage() {
  return (
    <div>
      <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">Demo frontend — read only</div>
      <TemplateRenderer bundle={demoBundle} showBranding allowCustomScripts={false} readOnly />
    </div>
  );
}

export function DemoGuidePage() {
  const s = demoBundle.settings;
  return (
    <div className="min-h-screen bg-dwell-beige px-5 py-16">
      <div className="mx-auto max-w-lg rounded-[16px] border border-dwell-sand bg-white p-8">
        <p className="text-xs text-amber-800">Demo guest guide</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">{s.property_name}</h1>
        <p className="mt-6">{s.guide_intro}</p>
        <div className="mt-6 rounded-[12px] bg-dwell-beige p-4">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <Wifi className="h-4 w-4" /> Wifi
          </div>
          <p className="mt-2 text-sm">
            {s.wifi_network} · {s.wifi_password}
          </p>
        </div>
        <div className="mt-4 rounded-[12px] bg-dwell-beige p-4">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <KeyRound className="h-4 w-4" /> Door
          </div>
          <p className="mt-2 text-sm">{s.door_password}</p>
        </div>
        <p className="mt-6 whitespace-pre-wrap text-sm text-dwell-muted">{s.guide_recommendations}</p>
      </div>
    </div>
  );
}
