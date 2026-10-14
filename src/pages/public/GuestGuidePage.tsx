import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GuestGuideView } from "@/components/property/GuestGuideView";
import { supabase } from "@/lib/supabase";
import type { HouseRule, Reservation, SiteSetting } from "@/types/database";

export function GuestGuidePage() {
  const { token } = useParams();
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [rules, setRules] = useState<HouseRule[]>([]);
  const [guest, setGuest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase || !token) {
        setError("Guide unavailable.");
        return;
      }
      const { data: reservation } = await supabase
        .from("reservations")
        .select("*")
        .eq("guide_token", token)
        .maybeSingle();
      const row = reservation as Reservation | null;
      let nextSettings: SiteSetting | null = null;
      if (row) {
        if (row.guide_expires_at && new Date(row.guide_expires_at).getTime() < Date.now()) {
          setError("This guest guide has expired.");
          return;
        }
        setGuest(row.guest_name);
        const { data } = await supabase.from("site_settings").select("*").eq("property_id", row.property_id).maybeSingle();
        nextSettings = data as SiteSetting | null;
      } else {
        const { data } = await supabase
          .from("site_settings")
          .select("*")
          .eq("guide_preview_token", token)
          .maybeSingle();
        nextSettings = data as SiteSetting | null;
      }
      if (!nextSettings) {
        setError("Guide not found.");
        return;
      }
      const { data: ruleRows } = await supabase
        .from("house_rules")
        .select("*")
        .eq("property_id", nextSettings.property_id)
        .order("sort_order");
      setSettings(nextSettings);
      setRules((ruleRows as HouseRule[]) ?? []);
    }
    void load();
  }, [token]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-dwell-beige px-5 text-center">{error}</div>;
  }
  if (!settings) {
    return <div className="flex min-h-screen items-center justify-center bg-dwell-beige">Loading…</div>;
  }

  return <GuestGuideView settings={settings} rules={rules} guest={guest} />;
}
