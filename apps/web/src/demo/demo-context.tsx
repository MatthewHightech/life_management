"use client";

import { createContext, useContext } from "react";

const DemoModeContext = createContext(false);

export function DemoModeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return <DemoModeContext.Provider value={enabled}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
