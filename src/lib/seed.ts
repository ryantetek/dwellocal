import { randomToken, RESERVED_SLUGS, slugify } from "@/lib/utils";
import type { TemplateId } from "@/lib/templates";
import { requireSupabase } from "@/lib/supabase";

export async function createPropertyWithSeed(input: {
  userId: string;
  name: string;
  slug?: string;
  template?: TemplateId;
}) {
  const supabase = requireSupabase();
  const baseSlug = slugify(input.slug || input.name) || "property";
  if (RESERVED_SLUGS.has(baseSlug)) {
    throw new Error("That web address is reserved. Please choose another.");
  }
  let slug = baseSlug;
  for (let i = 0; i < 8; i += 1) {
    const { data: existing } = await supabase.from("properties").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i + 2}`;
  }

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      user_id: input.userId,
      name: input.name,
      slug,
      template: input.template ?? "classic",
    })
    .select()
    .single();
  if (error) throw error;

  const hero =
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80";

  const { error: settingsError } = await supabase.from("site_settings").insert({
    property_id: property.id,
    property_name: input.name,
    hero_title: input.name,
    hero_subtitle: "A considered stay, presented simply.",
    hero_image_url: hero,
    location_summary: "Add your location",
    check_in_time: "16:00",
    check_out_time: "10:00",
    about_text: "Tell guests what makes this place feel like home.",
    wifi_network: "",
    wifi_password: "",
    door_password: "",
    guide_intro: "Welcome. Here is everything you need for a smooth arrival.",
    guide_recommendations: "Share your favorite coffee, walk, and supper.",
    guide_preview_token: randomToken(),
    hide_branding: false,
  });
  if (settingsError) throw settingsError;

  const amenities = [
    { name: "Wifi", description: "High-speed throughout.", icon: "wifi", sort_order: 0 },
    { name: "Kitchen", description: "Fully equipped for cooking.", icon: "kitchen", sort_order: 1 },
    { name: "Parking", description: "On-site parking for guests.", icon: "parking", sort_order: 2 },
  ].map((row) => ({ ...row, property_id: property.id, active: true }));
  await supabase.from("amenities").insert(amenities);

  const rules = [
    { title: "Quiet hours", description: "Please keep noise low after 10pm.", icon: "quiet", sort_order: 0 },
    { title: "Respect the property", description: "Treat it as you would a friend's home.", icon: "home", sort_order: 1 },
    { title: "Shoes at the door", description: "Help us keep the floors in good condition.", icon: "shoes", sort_order: 2 },
    { title: "No smoking indoors", description: "Please smoke outside only.", icon: "ban", sort_order: 3 },
    { title: "Check-out on time", description: "Leave by the posted check-out unless arranged.", icon: "clock", sort_order: 4 },
    { title: "Sort recycling", description: "Use the labeled bins in the kitchen.", icon: "recycle", sort_order: 5 },
  ].map((row) => ({ ...row, property_id: property.id, active: true }));
  await supabase.from("house_rules").insert(rules);

  await supabase.from("social_links").insert(
    [
      { platform: "Instagram", url: "", icon: "instagram", sort_order: 0 },
      { platform: "Facebook", url: "", icon: "facebook", sort_order: 1 },
      { platform: "TikTok", url: "", icon: "tiktok", sort_order: 2 },
    ].map((row) => ({ ...row, property_id: property.id })),
  );

  return property;
}
