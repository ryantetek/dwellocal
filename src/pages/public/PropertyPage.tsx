import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TemplateRenderer } from "@/components/property/TemplateRenderer";
import { supabase } from "@/lib/supabase";
import { resolvePlan } from "@/lib/plans";
import type { Amenity, GalleryMedia, HouseRule, Property, PropertyBundle, SiteSetting, SocialLink, UserPlan } from "@/types/database";

export function PropertyPage() {
  const { slug } = useParams();
  const [bundle, setBundle] = useState<PropertyBundle | null>(null);
  const [plan, setPlan] = useState(resolvePlan({ plan: "free" }));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase || !slug) {
        setError("This property page needs a connected database.");
        return;
      }
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (propError || !property) {
        setError("Property not found.");
        return;
      }
      const [settings, gallery, amenities, rules, social, userPlan] = await Promise.all([
        supabase.from("site_settings").select("*").eq("property_id", property.id).maybeSingle(),
        supabase.from("gallery_media").select("*").eq("property_id", property.id).order("sort_order"),
        supabase.from("amenities").select("*").eq("property_id", property.id).order("sort_order"),
        supabase.from("house_rules").select("*").eq("property_id", property.id).order("sort_order"),
        supabase.from("social_links").select("*").eq("property_id", property.id).order("sort_order"),
        supabase.from("user_plans").select("*").eq("user_id", (property as Property).user_id).maybeSingle(),
      ]);
      if (!settings.data) {
        setError("This property is still being set up.");
        return;
      }
      setPlan(resolvePlan((userPlan.data as UserPlan | null) ?? { plan: "free" }));
      setBundle({
        property: property as Property,
        settings: settings.data as SiteSetting,
        gallery: (gallery.data as GalleryMedia[]) ?? [],
        amenities: (amenities.data as Amenity[]) ?? [],
        rules: (rules.data as HouseRule[]) ?? [],
        social: (social.data as SocialLink[]) ?? [],
      });
    }
    void load();
  }, [slug]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-dwell-beige">{error}</div>;
  }
  if (!bundle) {
    return <div className="flex min-h-screen items-center justify-center bg-dwell-beige">Loading…</div>;
  }

  const showBranding = !(plan.plan === "pro" && bundle.settings.hide_branding);
  return (
    <TemplateRenderer
      bundle={bundle}
      showBranding={showBranding}
      allowCustomScripts={plan.customScripts}
    />
  );
}
