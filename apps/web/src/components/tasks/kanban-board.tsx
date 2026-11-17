"use client";

import { DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TaskStatus } from "@/graphql";
import { CreateTaskDocument, ClearDoneTasksDocument, MoveTaskDocument, TaskProjectsDocument } from "@/graphql";
import { KanbanCard } from "@/components/tasks/kanban-card";
import { KanbanColumnView } from "@/components/tasks/kanban-column";
import { useRegisterTaskDragHandlers } from "@/components/tasks/task-board-dnd";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import type { BoardTask } from "@/components/tasks/task-table/types";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import { useBoardTasks, useTaskActions } from "@/components/tasks/use-board-tasks";
import { tasksOnBoard } from "@/lib/task-boards";
import { kanbanColumnByStatus, kanbanColumns } from "@/lib/task-status";
import { tasksBoardKanbanQuery, tasksBoardRefetchQueries, updateTaskInBoardCaches } from "@/lib/task-board-queries";
import { cn } from "@/lib/cn";

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
  const { boards, activeBoardId, previewBoardId, setActiveBoardId } = useTaskBoards();
  const { tasks, boardTasks, fallbackBoardId, users, currentUserId, waiting, error } = useBoardTasks(
    tasksBoardKanbanQuery.variables,
  );
  const { onUpdate, onDelete } = useTaskActions();
  const [collapsedByStatus, setCollapsedByStatus] = useState<Partial<Record<TaskStatus, boolean>>>({
    DONE: true,
  });
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [activeWidth, setActiveWidth] = useState<number | null>(null);
  const [pendingTitleEditTaskId, setPendingTitleEditTaskId] = useState<string | null>(null);

  useEffect(() => {
    setPendingTitleEditTaskId(null);
  }, [activeBoardId]);

  const [createTask] = useMutation(CreateTaskDocument, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const [moveTask] = useMutation(MoveTaskDocument, {
    refetchQueries: [TaskProjectsDocument],
    update(cache, { data: result }) {
      if (result?.moveTask) {
        updateTaskInBoardCaches(cache, result.moveTask);
      }
    },
  });

  const [clearDoneTasks, { loading: clearingDone }] = useMutation(ClearDoneTasksDocument, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const previewTasks = useMemo(
    () => tasksOnBoard(tasks, previewBoardId, fallbackBoardId),
    [tasks, fallbackBoardId, previewBoardId],
  );

  const previewingOther = Boolean(previewBoardId && activeBoardId && previewBoardId !== activeBoardId);

  const handleAddTask = useCallback(
    async (status: TaskStatus, boardId: string) => {
      const result = await createTask({
        variables: {
          input: {
            title: "Untitled",
            status,
            assigneeIds: currentUserId ? [currentUserId] : undefined,
            isShared: true,
            projectId: boardId,
          },
        },
      });
      const createdId = result.data?.createTask?.id;
      if (createdId) {
        setPendingTitleEditTaskId(createdId);
        setCollapsedByStatus((current) =>
          current[status] ? { ...current, [status]: false } : current,
        );
      }
    },
    [createTask, currentUserId],
  );

  const handleTitleAutoEditApplied = useCallback(() => {
    queueMicrotask(() => {
      setPendingTitleEditTaskId(null);
    });
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (event.active.data.current?.type !== "task") {
        return;
      }
      const task = tasks.find((item) => item.id === event.active.id);
      setActiveTask(task ?? null);
      setActiveWidth(event.active.rect.current.initial?.width ?? null);
    },
    [tasks],
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
      const task = tasks.find((item) => item.id === String(active.id));
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
    [activeBoardId, boards, tasks, moveTask, setActiveBoardId],
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setActiveWidth(null);
  }, []);

  function renderColumns(boardId: string, columnTasks: BoardTask[], dropDisabled: boolean) {
    const tasksByStatus = groupTasks(columnTasks);
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
        onUpdateTask={onUpdate}
        onDeleteTask={onDelete}
        pendingTitleEditTaskId={pendingTitleEditTaskId}
        onTitleAutoEditApplied={handleTitleAutoEditApplied}
        onClearTasks={
          column.status === "DONE"
            ? async () => {
                await clearDoneTasks({ variables: { projectId: boardId } });
              }
            : undefined
        }
        clearingTasks={column.status === "DONE" ? clearingDone : false}
      />
    ));
  }

  return (
    <TasksPageLayout waiting={waiting} error={error} loadingLabel="Loading project…">
      {activeBoardId && (
        <>
          <KanbanDragRegistration
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          />
          <div
            className={cn(
              "flex gap-2 pb-4",
              previewingOther && "pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0",
            )}
            aria-hidden={previewingOther}
          >
            {renderColumns(activeBoardId, boardTasks, previewingOther)}
          </div>
          {previewingOther && previewBoardId ? (
            <div className="flex gap-2 pb-4">{renderColumns(previewBoardId, previewTasks, false)}</div>
          ) : null}
          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div style={activeWidth ? { width: activeWidth } : undefined}>
                <KanbanCard
                  task={activeTask}
                  accentClass={kanbanColumnByStatus[activeTask.status].accentClass}
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
