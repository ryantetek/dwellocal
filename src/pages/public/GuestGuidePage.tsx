import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { KeyRound, Wifi } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Reservation, SiteSetting } from "@/types/database";

export function GuestGuidePage() {
  const { token } = useParams();
  const [settings, setSettings] = useState<SiteSetting | null>(null);
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
      if (row) {
        if (row.guide_expires_at && new Date(row.guide_expires_at).getTime() < Date.now()) {
          setError("This guest guide has expired.");
          return;
        }
        setGuest(row.guest_name);
        const { data } = await supabase.from("site_settings").select("*").eq("property_id", row.property_id).maybeSingle();
        setSettings(data as SiteSetting | null);
        return;
      }
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("guide_preview_token", token)
        .maybeSingle();
      if (!data) setError("Guide not found.");
      else setSettings(data as SiteSetting);
    }
    void load();
  }, [token]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-dwell-beige px-5 text-center">{error}</div>;
  }
  if (!settings) {
    return <div className="flex min-h-screen items-center justify-center bg-dwell-beige">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-dwell-beige px-5 py-16">
      <div className="mx-auto max-w-lg rounded-[16px] border border-dwell-sand bg-white p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-dwell-muted">Guest guide</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">{settings.property_name}</h1>
        {guest ? <p className="mt-1 text-dwell-muted">For {guest}</p> : null}
        <p className="mt-6 leading-relaxed">{settings.guide_intro}</p>
        <div className="mt-8 space-y-4">
          <div className="rounded-[12px] bg-dwell-beige p-4">
            <div className="flex items-center gap-2 font-heading font-semibold">
              <Wifi className="h-4 w-4" /> Wifi
            </div>
            <p className="mt-2 text-sm">Network: {settings.wifi_network || "—"}</p>
            <p className="text-sm">Password: {settings.wifi_password || "—"}</p>
          </div>
          <div className="rounded-[12px] bg-dwell-beige p-4">
            <div className="flex items-center gap-2 font-heading font-semibold">
              <KeyRound className="h-4 w-4" /> Door
            </div>
            <p className="mt-2 text-sm">{settings.door_password || "—"}</p>
          </div>
        </div>
        <h2 className="mt-8 font-heading text-xl font-semibold">Recommendations</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-dwell-muted">
          {settings.guide_recommendations}
        </p>
      </div>
    </div>
  );
}
