import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoBundle } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import type { SiteSetting } from "@/types/database";

export function SettingsPage() {
  const { current } = useProperties();
  const { plan } = useAuth();
  const { isDemo } = useDemo();
  const [settings, setSettings] = useState<Partial<SiteSetting>>({});

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setSettings(demoBundle.settings);
      return;
    }
    if (!supabase) return;
    void supabase
      .from("site_settings")
      .select("*")
      .eq("property_id", current.id)
      .maybeSingle()
      .then(({ data }) => setSettings((data as SiteSetting) ?? {}));
  }, [current, isDemo]);

  async function save() {
    if (isDemo) return toast.message("Demo is read-only.");
    if (!plan.customScripts && (settings.ga4_id || settings.gtm_id || settings.custom_header_code || settings.custom_footer_code)) {
      toast.error("Custom scripts are a Pro feature.");
      return;
    }
    if (!supabase || !current) return;
    const payload = { ...settings, hide_branding: plan.hideBranding ? Boolean(settings.hide_branding) : false };
    const { error } = await supabase.from("site_settings").upsert({ ...payload, property_id: current.id });
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <div className="rounded-[16px] border border-slate-200 bg-white p-6">
        <Label>GA4 ID</Label>
        <Input className="border-slate-200" value={settings.ga4_id ?? ""} onChange={(e) => setSettings((s) => ({ ...s, ga4_id: e.target.value }))} disabled={!plan.customScripts} />
        <Label className="mt-4">GTM ID</Label>
        <Input className="border-slate-200" value={settings.gtm_id ?? ""} onChange={(e) => setSettings((s) => ({ ...s, gtm_id: e.target.value }))} disabled={!plan.customScripts} />
        <Label className="mt-4">Custom header code</Label>
        <Textarea className="border-slate-200" value={settings.custom_header_code ?? ""} onChange={(e) => setSettings((s) => ({ ...s, custom_header_code: e.target.value }))} disabled={!plan.customScripts} />
        <Label className="mt-4">Custom footer code</Label>
        <Textarea className="border-slate-200" value={settings.custom_footer_code ?? ""} onChange={(e) => setSettings((s) => ({ ...s, custom_footer_code: e.target.value }))} disabled={!plan.customScripts} />
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={!plan.hideBranding}
            checked={Boolean(settings.hide_branding)}
            onChange={(e) => setSettings((s) => ({ ...s, hide_branding: e.target.checked }))}
          />
          Hide “Powered by Dwellocal”
        </label>
        {!plan.hideBranding ? (
          <Button asChild variant="slate" size="sm" className="mt-3">
            <Link to={isDemo ? "/demo/admin/upgrade" : "/admin/upgrade"}>Upgrade to hide branding</Link>
          </Button>
        ) : null}
        <Button variant="slate" className="mt-6" onClick={() => void save()}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
