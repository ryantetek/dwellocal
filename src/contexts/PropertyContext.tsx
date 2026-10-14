import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoBundle } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import type { Property } from "@/types/database";

type PropertyContextValue = {
  properties: Property[];
  current: Property | null;
  setCurrentId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PropertyContext = createContext<PropertyContextValue | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (isDemo) {
      setProperties([demoBundle.property]);
      setCurrentId(demoBundle.property.id);
      setLoading(false);
      return;
    }
    if (!supabase || !user) {
      setProperties([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    const list = (data as Property[]) ?? [];
    setProperties(list);
    setCurrentId((prev) => prev ?? list[0]?.id ?? null);
    setLoading(false);
  }, [isDemo, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      properties,
      current: properties.find((p) => p.id === currentId) ?? properties[0] ?? null,
      setCurrentId: (id: string) => setCurrentId(id),
      loading,
      refresh,
    }),
    [currentId, loading, properties, refresh],
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperties() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error("useProperties must be used within PropertyProvider");
  return ctx;
}
