import type {
  Amenity,
  ChatMessage,
  ExpenseEntry,
  GalleryMedia,
  HouseRule,
  IncomeEntry,
  Property,
  PropertyBundle,
  Reservation,
  SiteSetting,
  SocialLink,
} from "@/types/database";

const property: Property = {
  id: "demo-property",
  user_id: "demo-host",
  name: "Cedar & Salt House",
  slug: "cedar-salt-house",
  template: "classic",
  created_at: "2026-01-12T00:00:00.000Z",
};

const settings: SiteSetting = {
  property_id: property.id,
  property_name: "Cedar & Salt House",
  hero_title: "A quiet house by the water",
  hero_subtitle: "Three bedrooms, a cedar deck, and mornings that start with the tide.",
  hero_image_url:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80",
  location_summary: "Harborview, Maine · 4 minutes to the village quay",
  check_in_time: "16:00",
  check_out_time: "10:00",
  about_text:
    "Cedar & Salt is a restored 1920s house with limewashed walls, linen bedding, and a kitchen meant for long breakfasts. The garden steps down to a private path toward the harbor. We host slowly, with space between stays, so the house always feels like yours.",
  wifi_network: "CedarSalt-Guest",
  wifi_password: "harborview16",
  door_password: "1920#",
  guide_intro:
    "Welcome. The key box is to the left of the cedar door. Lights in the hall are on a dimmer. Breakfast things are in the pantry, labeled.",
  guide_recommendations:
    "Coffee: Harbor Roasters (open 7am). Dinner: The Quay for oysters. Walk the breakwater at blue hour. Saturday market is on Elm Street.",
  guide_preview_token: "demo-guide-token",
  ga4_id: null,
  gtm_id: null,
  custom_header_code: null,
  custom_footer_code: null,
  admin_last_seen: new Date().toISOString(),
  hide_branding: false,
};

const gallery: GalleryMedia[] = [
  {
    id: "g1",
    property_id: property.id,
    media_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    media_type: "image",
    thumbnail_url: null,
    sort_order: 0,
  },
  {
    id: "g2",
    property_id: property.id,
    media_url:
      "https://images.unsplash.com/photo-1505691938895-1758d7a779f0?auto=format&fit=crop&w=1600&q=80",
    media_type: "image",
    thumbnail_url: null,
    sort_order: 1,
  },
  {
    id: "g3",
    property_id: property.id,
    media_url:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    media_type: "image",
    thumbnail_url: null,
    sort_order: 2,
  },
  {
    id: "g4",
    property_id: property.id,
    media_url:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    media_type: "image",
    thumbnail_url: null,
    sort_order: 3,
  },
];

const amenities: Amenity[] = [
  {
    id: "a1",
    property_id: property.id,
    name: "Harbor wifi",
    description: "Fast, reliable connection throughout the house.",
    icon: "wifi",
    image_url: null,
    active: true,
    sort_order: 0,
  },
  {
    id: "a2",
    property_id: property.id,
    name: "Chef's kitchen",
    description: "Gas range, espresso, and a pantry stocked with basics.",
    icon: "kitchen",
    image_url: null,
    active: true,
    sort_order: 1,
  },
  {
    id: "a3",
    property_id: property.id,
    name: "Private parking",
    description: "Two spaces beside the cedar hedge.",
    icon: "parking",
    image_url: null,
    active: true,
    sort_order: 2,
  },
  {
    id: "a4",
    property_id: property.id,
    name: "Outdoor shower",
    description: "Rinse off after the beach, under the pines.",
    icon: "shower",
    image_url: null,
    active: true,
    sort_order: 3,
  },
];

const rules: HouseRule[] = [
  {
    id: "r1",
    property_id: property.id,
    title: "Quiet after 10pm",
    description: "The lane is residential. Keep voices low after dusk.",
    icon: "quiet",
    active: true,
    sort_order: 0,
  },
  {
    id: "r2",
    property_id: property.id,
    title: "Shoes at the door",
    description: "Floors are original oak. Slippers are in the hall chest.",
    icon: "shoes",
    active: true,
    sort_order: 1,
  },
  {
    id: "r3",
    property_id: property.id,
    title: "No unannounced pets",
    description: "Well-mannered dogs are welcome with prior approval.",
    icon: "paw",
    active: true,
    sort_order: 2,
  },
];

const social: SocialLink[] = [
  {
    id: "s1",
    property_id: property.id,
    platform: "Instagram",
    url: "https://instagram.com",
    icon: "sparkles",
    sort_order: 0,
  },
];

export const demoReservations: Reservation[] = [
  {
    id: "res1",
    property_id: property.id,
    start_date: "2026-10-16",
    end_date: "2026-10-19",
    status: "reserved",
    guest_name: "Elena Moreau",
    guest_email: "elena@example.com",
    guest_phone: "+1 207 555 0144",
    party_size: 2,
    details: "Anniversary stay",
    notes: "Late check-in requested",
    guide_token: "demo-guide-token",
    guide_expires_at: "2026-10-20T00:00:00.000Z",
  },
  {
    id: "res2",
    property_id: property.id,
    start_date: "2026-10-24",
    end_date: "2026-10-28",
    status: "reserved",
    guest_name: "James Whitaker",
    guest_email: "james@example.com",
    guest_phone: "+1 207 555 0190",
    party_size: 4,
    details: "Family weekend",
    notes: "",
    guide_token: "jw-guide",
    guide_expires_at: "2026-10-29T00:00:00.000Z",
  },
];

export const demoMessages: ChatMessage[] = [
  {
    id: "m1",
    property_id: property.id,
    guest_name: "Priya Shah",
    guest_email: "priya@example.com",
    message: "Is the house available the first week of December, and is there a crib?",
    admin_reply: null,
    is_read: false,
    replied_at: null,
    created_at: "2026-10-12T14:22:00.000Z",
  },
];

export const demoIncome: IncomeEntry[] = [
  {
    id: "i1",
    property_id: property.id,
    guest_name: "Elena Moreau",
    amount: 1860,
    currency: "USD",
    entry_date: "2026-10-10",
    description: "3-night stay",
    payment_method: "Bank transfer",
  },
  {
    id: "i2",
    property_id: property.id,
    guest_name: "James Whitaker",
    amount: 2480,
    currency: "USD",
    entry_date: "2026-09-28",
    description: "4-night stay",
    payment_method: "Card (offline)",
  },
];

export const demoExpenses: ExpenseEntry[] = [
  {
    id: "e1",
    property_id: property.id,
    payee_name: "Harbor Clean Co",
    category: "Turnover",
    amount: 220,
    currency: "USD",
    entry_date: "2026-10-09",
    description: "Deep clean",
    payment_method: "Card",
  },
  {
    id: "e2",
    property_id: property.id,
    payee_name: "North Linen",
    category: "Supplies",
    amount: 86,
    currency: "USD",
    entry_date: "2026-10-02",
    description: "Towels restock",
    payment_method: "Cash",
  },
];

export const demoBundle: PropertyBundle = {
  property,
  settings,
  gallery,
  amenities,
  rules,
  social,
};

export const demoHostName = "Alex Rivera";
