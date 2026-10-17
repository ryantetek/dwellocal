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
  extrasReady: boolean;
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
  const [extrasReady, setExtrasReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

  const loadExtras = useCallback(async (userId: string) => {
    if (!supabase) {
      setExtrasReady(true);
      return;
    }
    try {
      const [{ data: profileRow }, { data: planRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_plans").select("*").eq("user_id", userId).maybeSingle(),
      ]);
      setProfile((profileRow as Profile | null) ?? null);
      setUserPlan((planRow as UserPlan | null) ?? null);
    } catch {
      setProfile(null);
      setUserPlan(null);
    } finally {
      setExtrasReady(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session?.user.id) {
        void loadExtras(data.session.user.id);
      } else {
        setExtrasReady(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
      if (next?.user.id) {
        void loadExtras(next.user.id);
      } else {
        setProfile(null);
        setUserPlan(null);
        setExtrasReady(true);
      }
    });
    const timeout = window.setTimeout(() => {
      setReady(true);
      setExtrasReady(true);
    }, 8000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [loadExtras]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const isSuperAdmin =
      profile?.role === "super_admin" ||
      user?.app_metadata?.role === "super_admin" ||
      user?.user_metadata?.role === "super_admin";
    return {
      ready,
      extrasReady,
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
  }, [extrasReady, loadExtras, profile, ready, session, userPlan]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
