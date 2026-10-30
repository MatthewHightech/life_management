"use client";

import { useMutation, useQuery } from "@apollo/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  CREATE_TASK_PROJECT_MUTATION,
  DELETE_TASK_PROJECT_MUTATION,
  RENAME_TASK_PROJECT_MUTATION,
  REORDER_TASK_PROJECTS_MUTATION,
  TASK_PROJECTS_QUERY,
  type TaskProjectsQuery,
} from "@/graphql";
import { moveBoardBefore } from "@/lib/task-boards";

export type TaskBoard = TaskProjectsQuery["taskProjects"][number];

const boardRefetch = ["TaskProjects", "TasksBoard"];

type TaskBoardsContextValue = {
  boards: TaskBoard[];
  boardsLoading: boolean;
  boardsError: string | null;
  activeBoardId: string | null;
  displayedBoardId: string | null;
  previewBoardId: string | null;
  editingBoardId: string | null;
  setEditingBoardId: (id: string | null) => void;
  setActiveBoardId: (id: string) => void;
  setPreviewBoardId: (id: string | null) => void;
  createBoard: () => Promise<void>;
  creatingBoard: boolean;
  renameBoard: (id: string, name: string) => Promise<void>;
  deleteBoard: (id: string, moveTasksToProjectId?: string | null) => Promise<void>;
  deletingBoard: boolean;
  beginBoardDrag: () => void;
  hoverBoardDrag: (activeId: string, overId: string) => void;
  finishBoardDrag: () => void;
  cancelBoardDrag: () => void;
};

const TaskBoardsContext = createContext<TaskBoardsContextValue | null>(null);

export function useTaskBoards() {
  const context = useContext(TaskBoardsContext);
  if (!context) {
    throw new Error("useTaskBoards must be used within TaskBoardsProvider");
  }
  return context;
}

export function TaskBoardsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("project");

  const { data, loading, error } = useQuery<TaskProjectsQuery>(TASK_PROJECTS_QUERY);
  const [boards, setBoards] = useState<TaskBoard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(requestedId);
  const [previewBoardId, setPreviewBoardIdState] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);

  const boardsRef = useRef<TaskBoard[]>([]);
  const draggingBoardRef = useRef(false);
  const orderSnapshotRef = useRef<TaskBoard[] | null>(null);

  const [createTaskProject, { loading: creatingBoard }] = useMutation(CREATE_TASK_PROJECT_MUTATION, {
    refetchQueries: boardRefetch,
    awaitRefetchQueries: true,
  });
  const [renameTaskProject] = useMutation(RENAME_TASK_PROJECT_MUTATION, {
    refetchQueries: boardRefetch,
    awaitRefetchQueries: true,
  });
  const [reorderTaskProjects] = useMutation(REORDER_TASK_PROJECTS_MUTATION, {
    refetchQueries: boardRefetch,
    awaitRefetchQueries: true,
  });
  const [deleteTaskProject, { loading: deletingBoard }] = useMutation(DELETE_TASK_PROJECT_MUTATION, {
    refetchQueries: boardRefetch,
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (draggingBoardRef.current || !data?.taskProjects) {
      return;
    }
    setBoards(data.taskProjects);
  }, [data?.taskProjects]);

  if (!draggingBoardRef.current) {
    boardsRef.current = boards;
  }

  useEffect(() => {
    if (requestedId) {
      setSelectedId(requestedId);
    }
  }, [requestedId]);

  const activeBoardId = boards.some((board) => board.id === selectedId) ? selectedId : (boards[0]?.id ?? null);

  useEffect(() => {
    if (!activeBoardId || requestedId === activeBoardId) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("project", activeBoardId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [activeBoardId, pathname, requestedId, router, searchParams]);

  function setActiveBoardId(id: string) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("project", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setPreviewBoardId(id: string | null) {
    setPreviewBoardIdState(id);
  }

  async function createBoard() {
    const result = await createTaskProject({ variables: { name: "New Project" } });
    const created = result.data?.createTaskProject;
    if (!created) {
      return;
    }
    setBoards((current) => (current.some((board) => board.id === created.id) ? current : [...current, created]));
    setEditingBoardId(created.id);
    setActiveBoardId(created.id);
  }

  async function renameBoard(id: string, name: string) {
    const trimmed = name.trim();
    const current = boardsRef.current.find((board) => board.id === id);
    setEditingBoardId(null);
    if (!current || !trimmed || trimmed === current.name) {
      return;
    }
    setBoards((existing) => existing.map((board) => (board.id === id ? { ...board, name: trimmed } : board)));
    await renameTaskProject({ variables: { id, name: trimmed } });
  }

  async function deleteBoard(id: string, moveTasksToProjectId?: string | null) {
    const snapshot = boardsRef.current;
    const remaining = snapshot.filter((board) => board.id !== id);
    if (remaining.length === 0) {
      return;
    }
    const previousActive = activeBoardId;
    if (previousActive === id) {
      setActiveBoardId(moveTasksToProjectId && moveTasksToProjectId !== id ? moveTasksToProjectId : remaining[0]!.id);
    }
    boardsRef.current = remaining;
    setBoards(remaining);
    try {
      await deleteTaskProject({
        variables: {
          id,
          moveTasksToProjectId: moveTasksToProjectId ?? null,
        },
      });
    } catch (error) {
      boardsRef.current = snapshot;
      setBoards(snapshot);
      if (previousActive) {
        setActiveBoardId(previousActive);
      }
      throw error;
    }
  }

  function beginBoardDrag() {
    draggingBoardRef.current = true;
    orderSnapshotRef.current = boardsRef.current;
  }

  function hoverBoardDrag(activeId: string, overId: string) {
    const next = moveBoardBefore(boardsRef.current, activeId, overId);
    if (next === boardsRef.current) {
      return;
    }
    boardsRef.current = next;
    setBoards(next);
  }

  function finishBoardDrag() {
    draggingBoardRef.current = false;
    const ids = boardsRef.current.map((board) => board.id);
    void reorderTaskProjects({ variables: { ids } }).catch(() => {
      if (orderSnapshotRef.current) {
        setBoards(orderSnapshotRef.current);
      }
    });
  }

  function cancelBoardDrag() {
    draggingBoardRef.current = false;
    if (orderSnapshotRef.current) {
      boardsRef.current = orderSnapshotRef.current;
      setBoards(orderSnapshotRef.current);
    }
  }

  const value: TaskBoardsContextValue = {
    boards,
    boardsLoading: loading,
    boardsError: error?.message ?? null,
    activeBoardId,
    displayedBoardId: previewBoardId ?? activeBoardId,
    previewBoardId,
    editingBoardId,
    setEditingBoardId,
    setActiveBoardId,
    setPreviewBoardId,
    createBoard,
    creatingBoard,
    renameBoard,
    deleteBoard,
    deletingBoard,
    beginBoardDrag,
    hoverBoardDrag,
    finishBoardDrag,
    cancelBoardDrag,
  };

  return <TaskBoardsContext.Provider value={value}>{children}</TaskBoardsContext.Provider>;
}
