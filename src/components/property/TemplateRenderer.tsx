import { Clock, MapPin } from "lucide-react";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { FadeIn } from "@/components/FadeIn";
import { GalleryLightbox } from "@/components/property/GalleryLightbox";
import { InquiryWidget } from "@/components/property/InquiryWidget";
import { TrackingScripts } from "@/components/property/TrackingScripts";
import { getIcon } from "@/lib/icons";
import type { TemplateId } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { PropertyBundle } from "@/types/database";

const variants: Record<
  TemplateId,
  { wrap: string; heroTitle: string; section: string; accent: string }
> = {
  classic: {
    wrap: "bg-dwell-beige text-dwell-charcoal",
    heroTitle: "font-heading text-4xl md:text-6xl",
    section: "mx-auto max-w-5xl px-5 py-16",
    accent: "text-dwell-deep",
  },
  modern: {
    wrap: "bg-[#f7f6f3] text-dwell-charcoal",
    heroTitle: "font-heading text-4xl tracking-tight md:text-6xl",
    section: "mx-auto max-w-6xl px-5 py-16",
    accent: "text-dwell-charcoal",
  },
  coastal: {
    wrap: "bg-[#f3f6f5] text-dwell-charcoal",
    heroTitle: "font-heading text-4xl md:text-6xl",
    section: "mx-auto max-w-5xl px-5 py-16",
    accent: "text-[#3d6a6e]",
  },
  editorial: {
    wrap: "bg-[#faf7f2] text-[#1b1814]",
    heroTitle: "font-heading text-5xl italic md:text-7xl",
    section: "mx-auto max-w-4xl px-5 py-20",
    accent: "text-[#6b5344]",
  },
  minimal: {
    wrap: "bg-white text-neutral-800",
    heroTitle: "font-heading text-4xl font-semibold md:text-5xl",
    section: "mx-auto max-w-4xl px-5 py-16",
    accent: "text-neutral-500",
  },
  luxe: {
    wrap: "bg-[#141210] text-[#efe8dc]",
    heroTitle: "font-heading text-4xl md:text-6xl",
    section: "mx-auto max-w-5xl px-5 py-16",
    accent: "text-[#c4b08a]",
  },
  nordic: {
    wrap: "bg-[#eef1f2] text-[#2a3033]",
    heroTitle: "font-heading text-4xl md:text-6xl",
    section: "mx-auto max-w-5xl px-5 py-16",
    accent: "text-[#5d6b70]",
  },
  heritage: {
    wrap: "bg-[#f3eadc] text-[#2c2418]",
    heroTitle: "font-heading text-4xl md:text-6xl",
    section: "mx-auto max-w-5xl px-5 py-16",
    accent: "text-[#7a5c38]",
  },
  tropic: {
    wrap: "bg-[#eef5ea] text-[#1d2a1f]",
    heroTitle: "font-heading text-4xl md:text-6xl",
    section: "mx-auto max-w-5xl px-5 py-16",
    accent: "text-[#3e6b46]",
  },
};

export function TemplateRenderer({
  bundle,
  showBranding,
  allowCustomScripts,
  readOnly,
}: {
  bundle: PropertyBundle;
  showBranding: boolean;
  allowCustomScripts: boolean;
  readOnly?: boolean;
}) {
  const { property, settings, gallery, amenities, rules, social } = bundle;
  const v = variants[property.template] ?? variants.classic;
  const dark = property.template === "luxe";

  return (
    <div className={cn("min-h-screen", v.wrap)}>
      <TrackingScripts
        ga4Id={settings.ga4_id}
        gtmId={settings.gtm_id}
        headerCode={settings.custom_header_code}
        footerCode={settings.custom_footer_code}
        allowCustom={allowCustomScripts}
      />
      <section className="relative min-h-[78vh]">
        <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-5xl flex-col justify-end px-5 pb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">{settings.property_name}</p>
          <h1 className={cn("mt-3 text-white", v.heroTitle)}>{settings.hero_title}</h1>
          <p className="mt-4 max-w-xl text-white/85">{settings.hero_subtitle}</p>
        </div>
      </section>

      <section className={v.section}>
        <FadeIn>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex gap-3">
              <MapPin className={cn("h-5 w-5", v.accent)} />
              <div>
                <p className="text-sm uppercase tracking-wider opacity-70">Location</p>
                <p>{settings.location_summary}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className={cn("h-5 w-5", v.accent)} />
              <div>
                <p className="text-sm uppercase tracking-wider opacity-70">Check-in / out</p>
                <p>
                  {settings.check_in_time} · {settings.check_out_time}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {social.map((link) => (
                <a key={link.id} href={link.url} className="underline underline-offset-4" target="_blank" rel="noreferrer">
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed opacity-90">{settings.about_text}</p>
        </FadeIn>
      </section>

      <section className={v.section}>
        <FadeIn>
          <h2 className="font-heading text-3xl font-bold">Amenities</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {amenities
              .filter((a) => a.active)
              .map((amenity) => {
                const Icon = getIcon(amenity.icon);
                return (
                  <div key={amenity.id} className="flex gap-4 rounded-[16px] border border-current/10 p-4">
                    <Icon className={cn("h-6 w-6 shrink-0", v.accent)} />
                    <div>
                      <p className="font-heading font-semibold">{amenity.name}</p>
                      <p className="mt-1 text-sm opacity-75">{amenity.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </FadeIn>
      </section>

      <section className={v.section}>
        <FadeIn>
          <h2 className="mb-8 font-heading text-3xl font-bold">Gallery</h2>
          <GalleryLightbox items={gallery} />
        </FadeIn>
      </section>

      <section className={v.section}>
        <FadeIn>
          <h2 className="font-heading text-3xl font-bold">House rules</h2>
          <div className="mt-8 space-y-4">
            {rules
              .filter((r) => r.active)
              .map((rule) => {
                const Icon = getIcon(rule.icon);
                return (
                  <div key={rule.id} className="flex gap-4">
                    <Icon className={cn("h-5 w-5", v.accent)} />
                    <div>
                      <p className="font-heading font-semibold">{rule.title}</p>
                      <p className="text-sm opacity-75">{rule.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </FadeIn>
      </section>

      <footer className={cn("border-t border-current/10 px-5 py-10", dark ? "bg-black/30" : "bg-white/30")}>
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="font-heading text-lg">{settings.property_name}</p>
          {showBranding ? (
            <div className="flex items-center gap-2 opacity-80">
              <span className="text-xs uppercase tracking-[0.16em]">Powered by</span>
              <DwellocalLogo inverted={dark} showTagline={false} markClassName="h-7 w-7" />
            </div>
          ) : null}
        </div>
      </footer>
      <InquiryWidget propertyId={property.id} readOnly={readOnly} />
    </div>
  );
}
