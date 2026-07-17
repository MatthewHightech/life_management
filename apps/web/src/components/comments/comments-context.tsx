"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CommentsTarget = {
  id: string;
  title: string;
};

type CommentsContextValue = {
  activeTarget: CommentsTarget | null;
  openComments: (target: CommentsTarget) => void;
  closeComments: () => void;
};

const CommentsContext = createContext<CommentsContextValue | null>(null);

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const [activeTarget, setActiveTarget] = useState<CommentsTarget | null>(null);

  const openComments = useCallback((target: CommentsTarget) => {
    setActiveTarget(target);
  }, []);

  const closeComments = useCallback(() => {
    setActiveTarget(null);
  }, []);

  const value = useMemo(
    () => ({ activeTarget, openComments, closeComments }),
    [activeTarget, openComments, closeComments],
  );

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within CommentsProvider");
  }
  return context;
}
