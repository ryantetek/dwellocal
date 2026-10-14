import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { resolvePlan, type EffectivePlan } from "@/lib/plans";
import type { Profile, UserPlan } from "@/types/database";

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  plan: EffectivePlan;
  isSuperAdmin: boolean;
  configured: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const fallbackPlan = resolvePlan({ plan: "free" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

  const loadExtras = useCallback(async (userId: string) => {
    if (!supabase) return;
    const [{ data: profileRow }, { data: planRow }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_plans").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    setProfile((profileRow as Profile | null) ?? null);
    setUserPlan((planRow as UserPlan | null) ?? null);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user.id) {
        loadExtras(data.session.user.id).finally(() => setReady(true));
      } else {
        setReady(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user.id) {
        void loadExtras(next.user.id);
      } else {
        setProfile(null);
        setUserPlan(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadExtras]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const isSuperAdmin =
      profile?.role === "super_admin" ||
      user?.app_metadata?.role === "super_admin" ||
      user?.user_metadata?.role === "super_admin";
    return {
      ready,
      session,
      user,
      profile,
      plan: userPlan
        ? resolvePlan(userPlan)
        : fallbackPlan,
      isSuperAdmin,
      configured: isSupabaseConfigured,
      refreshProfile: async () => {
        if (user) await loadExtras(user.id);
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    };
  }, [loadExtras, profile, ready, session, userPlan]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
