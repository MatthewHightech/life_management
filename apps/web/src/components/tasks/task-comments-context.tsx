"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type TaskCommentsTarget = {
  id: string;
  title: string;
};

type TaskCommentsContextValue = {
  activeTask: TaskCommentsTarget | null;
  openComments: (task: TaskCommentsTarget) => void;
  closeComments: () => void;
};

const TaskCommentsContext = createContext<TaskCommentsContextValue | null>(null);

export function TaskCommentsProvider({ children }: { children: React.ReactNode }) {
  const [activeTask, setActiveTask] = useState<TaskCommentsTarget | null>(null);

  const openComments = useCallback((task: TaskCommentsTarget) => {
    setActiveTask(task);
  }, []);

  const closeComments = useCallback(() => {
    setActiveTask(null);
  }, []);

  const value = useMemo(
    () => ({ activeTask, openComments, closeComments }),
    [activeTask, openComments, closeComments],
  );

  return <TaskCommentsContext.Provider value={value}>{children}</TaskCommentsContext.Provider>;
}

export function useTaskComments() {
  const context = useContext(TaskCommentsContext);
  if (!context) {
    throw new Error("useTaskComments must be used within TaskCommentsProvider");
  }

  return context;
}
