import { createContext, useContext, type ReactNode } from "react";

type DemoContextValue = {
  isDemo: boolean;
};

const DemoContext = createContext<DemoContextValue>({ isDemo: false });

export function DemoProvider({ children, isDemo = false }: { children: ReactNode; isDemo?: boolean }) {
  return <DemoContext.Provider value={{ isDemo }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
