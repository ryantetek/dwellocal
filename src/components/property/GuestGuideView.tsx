import { Clock, KeyRound, Mail, Phone, Wifi } from "lucide-react";
import { DemoRibbon } from "@/components/DemoRibbon";
import { getIcon } from "@/lib/icons";
import type { HouseRule, SiteSetting } from "@/types/database";

export function GuestGuideView({
  settings,
  rules,
  guest,
  demo,
}: {
  settings: SiteSetting;
  rules: HouseRule[];
  guest?: string | null;
  demo?: boolean;
}) {
  const activeRules = rules.filter((rule) => rule.active);

  return (
    <div className="min-h-screen bg-dwell-beige px-5 py-16">
      {demo ? <DemoRibbon /> : null}
      <div className="mx-auto max-w-lg rounded-[16px] border border-dwell-sand bg-white p-8">
        {demo ? <p className="text-xs text-amber-800">Demo guest guide</p> : (
          <p className="text-sm uppercase tracking-[0.18em] text-dwell-muted">Guest guide</p>
        )}
        <h1 className="mt-2 font-heading text-3xl font-bold">{settings.property_name}</h1>
        {guest ? <p className="mt-1 text-dwell-muted">For {guest}</p> : null}
        <p className="mt-6 leading-relaxed">{settings.guide_intro}</p>
        <div className="mt-8 space-y-4">
          <div className="rounded-[12px] bg-dwell-beige p-4">
            <div className="flex items-center gap-2 font-heading font-semibold">
              <Clock className="h-4 w-4" /> Check-in / out
            </div>
            <p className="mt-2 text-sm">
              In {settings.check_in_time || "—"} · Out {settings.check_out_time || "—"}
            </p>
          </div>
          {settings.contact_email || settings.contact_phone ? (
            <div className="rounded-[12px] bg-dwell-beige p-4">
              <p className="font-heading font-semibold">Host contact</p>
              {settings.contact_email ? (
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a className="underline-offset-4 hover:underline" href={`mailto:${settings.contact_email}`}>
                    {settings.contact_email}
                  </a>
                </p>
              ) : null}
              {settings.contact_phone ? (
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a
                    className="underline-offset-4 hover:underline"
                    href={`tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`}
                  >
                    {settings.contact_phone}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
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
        {activeRules.length ? (
          <>
            <h2 className="mt-8 font-heading text-xl font-semibold">Stay rules</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {activeRules.map((rule) => {
                const Icon = getIcon(rule.icon);
                return (
                  <div key={rule.id} className="rounded-[12px] bg-dwell-beige p-3">
                    <div className="flex gap-2 font-heading text-sm font-semibold">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      {rule.title}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-dwell-muted">{rule.description}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
        <h2 className="mt-8 font-heading text-xl font-semibold">Recommendations</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-dwell-muted">
          {settings.guide_recommendations}
        </p>
      </div>
    </div>
  );
}
