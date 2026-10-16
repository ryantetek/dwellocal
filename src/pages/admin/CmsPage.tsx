import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoBundle } from "@/data/demo";
import { ICON_OPTIONS, getIcon } from "@/lib/icons";
import { getSocialIcon } from "@/lib/socialIcons";
import { supabase } from "@/lib/supabase";
import type { Amenity, HouseRule, SiteSetting, SocialLink } from "@/types/database";

export function CmsPage() {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const { plan } = useAuth();
  const [settings, setSettings] = useState<Partial<SiteSetting>>({});
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [rules, setRules] = useState<HouseRule[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setSettings(demoBundle.settings);
      setAmenities(demoBundle.amenities);
      setRules(demoBundle.rules);
      setSocial(demoBundle.social);
      return;
    }
    if (!supabase) return;
    void Promise.all([
      supabase.from("site_settings").select("*").eq("property_id", current.id).maybeSingle(),
      supabase.from("amenities").select("*").eq("property_id", current.id).order("sort_order"),
      supabase.from("house_rules").select("*").eq("property_id", current.id).order("sort_order"),
      supabase.from("social_links").select("*").eq("property_id", current.id).order("sort_order"),
    ]).then(([s, a, r, so]) => {
      setSettings((s.data as SiteSetting) ?? {});
      setAmenities((a.data as Amenity[]) ?? []);
      setRules((r.data as HouseRule[]) ?? []);
      setSocial((so.data as SocialLink[]) ?? []);
    });
  }, [current, isDemo]);

  function blockIfDemo() {
    if (isDemo) {
      toast.message("Demo is read-only.");
      return true;
    }
    return false;
  }

  async function saveSettings() {
    if (blockIfDemo() || !current || !supabase) return;
    const { error } = await supabase.from("site_settings").upsert({ ...settings, property_id: current.id });
    if (error) toast.error(error.message);
    else toast.success("Saved");
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold">Content</h1>
      <section className="rounded-[16px] border border-slate-200 bg-white p-6">
        <h2 className="font-heading font-semibold">General info</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(
            [
              ["property_name", "Property name"],
              ["hero_title", "Hero title"],
              ["hero_subtitle", "Hero subtitle"],
              ["hero_image_url", "Hero image URL"],
              ["location_summary", "Location"],
              ["contact_email", "Email"],
              ["contact_phone", "Phone number"],
              ["check_in_time", "Check-in"],
              ["check_out_time", "Check-out"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                className="border-slate-200"
                type={key === "contact_email" ? "email" : key === "contact_phone" ? "tel" : "text"}
                value={String(settings[key] ?? "")}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Label>About</Label>
          <Textarea
            className="border-slate-200"
            value={settings.about_text ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, about_text: e.target.value }))}
          />
        </div>
        <h3 className="mt-6 font-heading font-semibold">Guest guide</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <Label>Wifi network</Label>
            <Input className="border-slate-200" value={settings.wifi_network ?? ""} onChange={(e) => setSettings((s) => ({ ...s, wifi_network: e.target.value }))} />
          </div>
          <div>
            <Label>Wifi password</Label>
            <Input className="border-slate-200" value={settings.wifi_password ?? ""} onChange={(e) => setSettings((s) => ({ ...s, wifi_password: e.target.value }))} />
          </div>
          <div>
            <Label>Door password</Label>
            <Input className="border-slate-200" value={settings.door_password ?? ""} onChange={(e) => setSettings((s) => ({ ...s, door_password: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4">
          <Label>Guide intro</Label>
          <Textarea className="border-slate-200" value={settings.guide_intro ?? ""} onChange={(e) => setSettings((s) => ({ ...s, guide_intro: e.target.value }))} />
        </div>
        <div className="mt-4">
          <Label>Recommendations</Label>
          <Textarea className="border-slate-200" value={settings.guide_recommendations ?? ""} onChange={(e) => setSettings((s) => ({ ...s, guide_recommendations: e.target.value }))} />
        </div>
        <Button variant="slate" className="mt-4" onClick={() => void saveSettings()}>
          Save general info
        </Button>
        {plan.plan === "free" ? <p className="mt-2 text-xs text-slate-500">Guest guide codes appear only on the tokenized guide page, not the public site.</p> : null}
      </section>

      <ListEditor
        title="Amenities"
        rows={amenities}
        onChange={setAmenities}
        fields={["name", "description"]}
        table="amenities"
        propertyId={current?.id}
        demo={isDemo}
      />
      <ListEditor
        title="Stay rules"
        rows={rules}
        onChange={setRules}
        fields={["title", "description"]}
        table="house_rules"
        propertyId={current?.id}
        demo={isDemo}
      />
      <ListEditor
        title="Social links"
        rows={social}
        onChange={setSocial}
        fields={["platform", "url"]}
        table="social_links"
        propertyId={current?.id}
        demo={isDemo}
      />
    </div>
  );
}

function ListEditor<T extends { id: string; icon?: string }>({
  title,
  rows,
  onChange,
  fields,
  table,
  propertyId,
  demo,
}: {
  title: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  fields: string[];
  table: string;
  propertyId?: string;
  demo: boolean;
}) {
  async function save(row: T) {
    if (demo) return toast.message("Demo is read-only.");
    if (!supabase || !propertyId) return;
    const { error } = await supabase.from(table).upsert({ ...row, property_id: propertyId });
    if (error) toast.error(error.message);
    else toast.success("Saved");
  }

  return (
    <section className="rounded-[16px] border border-slate-200 bg-white p-6">
      <h2 className="font-heading font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">
        {rows.map((row, index) => {
          const isSocial = table === "social_links";
          const platform = String((row as { platform?: string }).platform ?? "");
          const Icon = isSocial ? getSocialIcon(platform, row.icon) : getIcon(row.icon);
          const iconChoices = isSocial ? ["instagram", "facebook", "tiktok", ...ICON_OPTIONS] : ICON_OPTIONS;
          return (
            <div key={row.id} className="grid gap-3 rounded-[12px] border border-slate-100 p-3 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                <select
                  className="h-10 w-full rounded-[12px] border border-slate-200 px-2 text-sm"
                  value={row.icon ?? (isSocial ? "instagram" : "home")}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...row, icon: e.target.value };
                    onChange(next);
                  }}
                >
                  {iconChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              {fields.map((field) => (
                <Input
                  key={field}
                  className="border-slate-200"
                  value={String((row as Record<string, unknown>)[field] ?? "")}
                  onChange={(e) => {
                    const next = [...rows];
                    const value = e.target.value;
                    const extra =
                      isSocial && field === "platform"
                        ? { icon: value.toLowerCase().replace(/\s+/g, "") }
                        : {};
                    next[index] = { ...row, [field]: value, ...extra };
                    onChange(next);
                  }}
                />
              ))}
              <Button variant="slate-outline" size="sm" onClick={() => void save(row)}>
                Save
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
