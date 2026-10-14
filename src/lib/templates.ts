export const FREE_TEMPLATES = ["classic", "modern", "coastal"] as const;
export const PRO_TEMPLATES = [
  "editorial",
  "minimal",
  "luxe",
  "nordic",
  "heritage",
  "tropic",
] as const;

export const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PRO_TEMPLATES] as const;
export type TemplateId = (typeof ALL_TEMPLATES)[number];

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  description: string;
  tier: "free" | "pro";
  preview: string;
};

export const TEMPLATE_META: TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Warm, timeless hospitality with generous photography.",
    tier: "free",
    preview:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean geometry, quiet luxury, and crisp typography.",
    tier: "free",
    preview:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Light, breezy, and sea-salted for waterfront stays.",
    tier: "free",
    preview:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-style layouts for distinctive properties.",
    tier: "pro",
    preview:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Spare, gallery-like, and focused on space.",
    tier: "pro",
    preview:
      "https://images.unsplash.com/photo-1505691938895-1758d7a779f0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "luxe",
    name: "Luxe",
    description: "Deep tones and refined details for high-end stays.",
    tier: "pro",
    preview:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "nordic",
    name: "Nordic",
    description: "Soft light, pale woods, and calm winter warmth.",
    tier: "pro",
    preview:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c313?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "heritage",
    name: "Heritage",
    description: "Character architecture with storied interiors.",
    tier: "pro",
    preview:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "tropic",
    name: "Tropic",
    description: "Lush, sun-drenched, and outdoor-first.",
    tier: "pro",
    preview:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  },
];

export function isProTemplate(id: string) {
  return (PRO_TEMPLATES as readonly string[]).includes(id);
}

export function isTemplateId(id: string): id is TemplateId {
  return (ALL_TEMPLATES as readonly string[]).includes(id);
}
