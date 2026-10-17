import { supabase } from "@/lib/supabase";

/** Flip to true when Google / Facebook providers are ready in Supabase. */
export const SOCIAL_AUTH_ENABLED = false;

const PENDING_KEY = "dwellocal.pendingProperty";

export function stashPendingProperty(name: string, slug?: string) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ name, slug: slug || undefined }));
}

export function readPendingProperty(): { name: string; slug?: string } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string; slug?: string };
    if (!parsed.name?.trim()) return null;
    return { name: parsed.name.trim(), slug: parsed.slug };
  } catch {
    return null;
  }
}

export function clearPendingProperty() {
  sessionStorage.removeItem(PENDING_KEY);
}

export async function signInWithSocial(provider: "google" | "facebook") {
  if (!supabase) {
    return { error: new Error("Supabase is not configured.") };
  }
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/after-login`,
      skipBrowserRedirect: false,
      ...(provider === "google"
        ? { queryParams: { access_type: "offline", prompt: "consent" } }
        : { scopes: "email,public_profile" }),
    },
  });
}
