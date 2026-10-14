export type PlanId = "free" | "pro";

export const PLAN_LIMITS = {
  free: {
    propertyLimit: 1,
    galleryLimit: 6,
    hideBranding: false,
    customScripts: false,
    allTemplates: false,
  },
  pro: {
    propertyLimit: 10,
    galleryLimit: 20,
    hideBranding: true,
    customScripts: true,
    allTemplates: true,
  },
} as const;

export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export type EffectivePlan = {
  plan: PlanId;
  propertyLimit: number;
  galleryLimit: number;
  hideBranding: boolean;
  customScripts: boolean;
  allTemplates: boolean;
  expiresAt: string | null;
  isExpired: boolean;
};

export function resolvePlan(input: {
  plan: PlanId | string | null;
  plan_expires_at?: string | null;
  property_limit?: number | null;
  hide_branding?: boolean | null;
}): EffectivePlan {
  const now = Date.now();
  const expiresAt = input.plan_expires_at ?? null;
  const isExpired = Boolean(expiresAt && new Date(expiresAt).getTime() < now);
  const plan: PlanId = !isExpired && input.plan === "pro" ? "pro" : "free";
  const limits = PLAN_LIMITS[plan];
  return {
    plan,
    propertyLimit: input.property_limit ?? limits.propertyLimit,
    galleryLimit: limits.galleryLimit,
    hideBranding: plan === "pro" && (input.hide_branding ?? true),
    customScripts: limits.customScripts,
    allTemplates: limits.allTemplates,
    expiresAt,
    isExpired,
  };
}
