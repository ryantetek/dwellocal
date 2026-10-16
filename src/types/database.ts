import type { TemplateId } from "@/lib/templates";
import type { PlanId } from "@/lib/plans";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin" | "super_admin";
export type ReservationStatus = "reserved" | "available";
export type MediaType = "image" | "video";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: ApprovalStatus;
  created_at: string;
};

export type UserPlan = {
  user_id: string;
  plan: PlanId;
  plan_expires_at: string | null;
  property_limit: number;
  hide_branding: boolean;
};

export type Property = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  template: TemplateId;
  created_at: string;
};

export type SiteSetting = {
  property_id: string;
  property_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  location_summary: string;
  contact_email: string;
  contact_phone: string;
  check_in_time: string;
  check_out_time: string;
  about_text: string;
  wifi_network: string;
  wifi_password: string;
  door_password: string;
  guide_intro: string;
  guide_recommendations: string;
  guide_preview_token: string | null;
  ga4_id: string | null;
  gtm_id: string | null;
  custom_header_code: string | null;
  custom_footer_code: string | null;
  admin_last_seen: string | null;
  hide_branding: boolean;
};

export type GalleryMedia = {
  id: string;
  property_id: string;
  media_url: string;
  media_type: MediaType;
  thumbnail_url: string | null;
  sort_order: number;
};

export type Amenity = {
  id: string;
  property_id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export type HouseRule = {
  id: string;
  property_id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  sort_order: number;
};

export type SocialLink = {
  id: string;
  property_id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
};

export type Reservation = {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  details: string;
  notes: string;
  guide_token: string | null;
  guide_expires_at: string | null;
};

export type ChatMessage = {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  message: string;
  admin_reply: string | null;
  is_read: boolean;
  replied_at: string | null;
  created_at: string;
};

export type IncomeEntry = {
  id: string;
  property_id: string;
  guest_name: string;
  amount: number;
  currency: string;
  entry_date: string;
  description: string;
  payment_method: string;
};

export type ExpenseEntry = {
  id: string;
  property_id: string;
  payee_name: string;
  category: string;
  amount: number;
  currency: string;
  entry_date: string;
  description: string;
  payment_method: string;
};

export type AdminMessage = {
  id: string;
  user_id: string;
  parent_id: string | null;
  category: string;
  subject: string;
  body: string;
  from_super_admin: boolean;
  is_read: boolean;
  created_at: string;
};

export type PropertyBundle = {
  property: Property;
  settings: SiteSetting;
  gallery: GalleryMedia[];
  amenities: Amenity[];
  rules: HouseRule[];
  social: SocialLink[];
};
