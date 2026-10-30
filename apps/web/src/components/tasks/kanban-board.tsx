"use client";

import { DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";
import type { TaskStatus, TasksBoardQuery, TasksBoardQueryVariables, UpdateTaskMutationVariables } from "@/graphql";
import {
  CREATE_TASK_MUTATION,
  CLEAR_DONE_TASKS_MUTATION,
  DELETE_TASK_MUTATION,
  MOVE_TASK_MUTATION,
  TASK_PROJECTS_QUERY,
  TASKS_BOARD_QUERY,
  UPDATE_TASK_MUTATION,
} from "@/graphql";
import { KanbanCard } from "@/components/tasks/kanban-card";
import { KanbanColumnView } from "@/components/tasks/kanban-column";
import { useRegisterTaskDragHandlers } from "@/components/tasks/task-board-dnd";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import { tasksOnBoard } from "@/lib/task-boards";
import { kanbanColumns } from "@/lib/task-status";
import { tasksBoardKanbanQuery, tasksBoardRefetchQueries, updateTaskInBoardCaches } from "@/lib/task-board-queries";
import { cn } from "@/lib/cn";

type BoardTask = TasksBoardQuery["tasks"][number];

const kanbanQuery = tasksBoardKanbanQuery;

function KanbanDragRegistration({
  onDragStart,
  onDragEnd,
  onDragCancel,
}: {
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
}) {
  useRegisterTaskDragHandlers({ onDragStart, onDragEnd, onDragCancel });
  return null;
}

function groupTasks(tasks: BoardTask[]) {
  const grouped = Object.fromEntries(kanbanColumns.map((column) => [column.status, [] as BoardTask[]])) as Record<
    TaskStatus,
    BoardTask[]
  >;

  for (const task of tasks) {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  }

  return grouped;
}

export function KanbanBoard() {
  const {
    boards,
    boardsLoading,
    activeBoardId,
    previewBoardId,
    setActiveBoardId,
  } = useTaskBoards();
  const [collapsedByStatus, setCollapsedByStatus] = useState<Partial<Record<TaskStatus, boolean>>>({
    DONE: true,
  });
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [activeWidth, setActiveWidth] = useState<number | null>(null);
  const [focusTitleTaskId, setFocusTitleTaskId] = useState<string | null>(null);

  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: kanbanQuery.variables,
  });

  const [createTask] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const [moveTask] = useMutation(MOVE_TASK_MUTATION, {
    refetchQueries: [TASK_PROJECTS_QUERY],
    update(cache, { data: result }) {
      if (result?.moveTask) {
        updateTaskInBoardCaches(cache, result.moveTask);
      }
    },
  });

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const [clearDoneTasks, { loading: clearingDone }] = useMutation(CLEAR_DONE_TASKS_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const handleUpdate = useCallback(
    async (id: string, input: UpdateTaskMutationVariables["input"]) => {
      await updateTask({ variables: { id, input } });
    },
    [updateTask],
  );

  const handleDelete = useCallback(
    (id: string) => {
      void deleteTask({ variables: { id } });
    },
    [deleteTask],
  );

  const handleClearDone = useCallback(
    async (boardId: string) => {
      await clearDoneTasks({ variables: { projectId: boardId } });
    },
    [clearDoneTasks],
  );

  const fallbackBoardId = boards[0]?.id ?? null;
  const activeTasks = useMemo(
    () => tasksOnBoard(data?.tasks ?? [], activeBoardId, fallbackBoardId),
    [activeBoardId, data?.tasks, fallbackBoardId],
  );
  const previewTasks = useMemo(
    () => tasksOnBoard(data?.tasks ?? [], previewBoardId, fallbackBoardId),
    [data?.tasks, fallbackBoardId, previewBoardId],
  );

  const accentByStatus = Object.fromEntries(
    kanbanColumns.map((column) => [column.status, column.accentClass]),
  ) as Record<TaskStatus, string>;

  const users = data?.household?.users ?? [];
  const currentUserId = data?.me?.id;
  const previewingOther = Boolean(previewBoardId && activeBoardId && previewBoardId !== activeBoardId);

  const handleAddTask = useCallback(
    async (status: TaskStatus, boardId: string) => {
      const result = await createTask({
        variables: {
          input: {
            title: "Untitled",
            status,
            priority: "LOW",
            assigneeIds: currentUserId ? [currentUserId] : undefined,
            isShared: true,
            projectId: boardId,
          },
        },
      });
      const createdId = result.data?.createTask?.id;
      if (createdId) {
        setFocusTitleTaskId(createdId);
        setCollapsedByStatus((current) =>
          current[status] ? { ...current, [status]: false } : current,
        );
      }
    },
    [createTask, currentUserId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (event.active.data.current?.type !== "task") {
        return;
      }
      const task = data?.tasks.find((item: BoardTask) => item.id === event.active.id);
      setActiveTask(task ?? null);
      setActiveWidth(event.active.rect.current.initial?.width ?? null);
    },
    [data?.tasks],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setActiveWidth(null);

      const overData = over?.data.current;
      if (overData?.type !== "column" || typeof overData.boardId !== "string") {
        return;
      }

      const newStatus = overData.status as TaskStatus;
      const destinationBoardId = overData.boardId;
      const task = data?.tasks.find((item) => item.id === String(active.id));
      if (!task || !destinationBoardId) {
        return;
      }

      const sameBoard = (task.project?.id ?? activeBoardId) === destinationBoardId;
      if (sameBoard && task.status === newStatus) {
        return;
      }

      const destination = boards.find((board) => board.id === destinationBoardId);
      void moveTask({
        variables: { id: task.id, status: newStatus, projectId: destinationBoardId },
        optimisticResponse: {
          moveTask: {
            __typename: "Task",
            ...task,
            status: newStatus,
            completedAt: newStatus === "DONE" ? (task.completedAt ?? new Date().toISOString()) : null,
            project: destination
              ? { __typename: "TaskProject", id: destination.id, name: destination.name }
              : task.project,
          },
        },
      });

      if (!sameBoard) {
        setActiveBoardId(destinationBoardId);
      }
    },
    [activeBoardId, boards, data?.tasks, moveTask, setActiveBoardId],
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setActiveWidth(null);
  }, []);

  function renderColumns(boardId: string, tasks: BoardTask[], dropDisabled: boolean) {
    const tasksByStatus = groupTasks(tasks);
    return kanbanColumns.map((column) => (
      <KanbanColumnView
        key={`${boardId}:${column.status}`}
        column={column}
        boardId={boardId}
        tasks={tasksByStatus[column.status] ?? []}
        users={users}
        collapsed={collapsedByStatus[column.status] ?? false}
        dropDisabled={dropDisabled}
        onToggleCollapsed={() =>
          setCollapsedByStatus((current) => ({
            ...current,
            [column.status]: !current[column.status],
          }))
        }
        onAddTask={(status) => void handleAddTask(status, boardId)}
        onUpdateTask={handleUpdate}
        onDeleteTask={handleDelete}
        focusTitleTaskId={focusTitleTaskId}
        onClearTasks={column.status === "DONE" ? () => handleClearDone(boardId) : undefined}
        clearingTasks={column.status === "DONE" ? clearingDone : false}
      />
    ));
  }

  const waiting = loading || (boardsLoading && !activeBoardId);

  return (
    <TasksPageLayout>
      {waiting && <p className="text-sm text-text-muted">Loading board…</p>}
      {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

      {!waiting && !error && activeBoardId && (
        <>
          <KanbanDragRegistration
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          />
          {/* Keep the origin columns mounted while a drag previews another board so the card stays draggable. */}
          <div
            className={cn(
              "flex gap-2 pb-4",
              previewingOther && "pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0",
            )}
            aria-hidden={previewingOther}
          >
            {renderColumns(activeBoardId, activeTasks, previewingOther)}
          </div>
          {previewingOther && previewBoardId ? (
            <div className="flex gap-2 pb-4">{renderColumns(previewBoardId, previewTasks, false)}</div>
          ) : null}
          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div style={activeWidth ? { width: activeWidth } : undefined}>
                <KanbanCard
                  task={activeTask}
                  accentClass={accentByStatus[activeTask.status]}
                  users={users}
                  overlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </>
      )}
    </TasksPageLayout>
  );
}
