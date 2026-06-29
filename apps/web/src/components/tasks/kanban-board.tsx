"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";
import type { TaskStatus, TasksBoardQuery, TasksBoardQueryVariables, UpdateTaskMutationVariables } from "@/graphql";
import {
  CREATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  MOVE_TASK_MUTATION,
  TASKS_BOARD_QUERY,
  UPDATE_TASK_MUTATION,
} from "@/graphql";
import { KanbanCard } from "@/components/tasks/kanban-card";
import { KanbanColumnView } from "@/components/tasks/kanban-column";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import { kanbanColumns } from "@/lib/task-status";
import { tasksBoardKanbanQuery, tasksBoardRefetchQueries, updateTaskInBoardCaches } from "@/lib/task-board-queries";

type BoardTask = TasksBoardQuery["tasks"][number];

const kanbanQuery = tasksBoardKanbanQuery;

export function KanbanBoard() {
  const [doneCollapsed, setDoneCollapsed] = useState(true);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [activeWidth, setActiveWidth] = useState<number | null>(null);

  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: kanbanQuery.variables,
  });

  const [createTask] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const [moveTask] = useMutation(MOVE_TASK_MUTATION, {
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(kanbanColumns.map((column) => [column.status, [] as BoardTask[]])) as Record<
      TaskStatus,
      BoardTask[]
    >;

    for (const task of data?.tasks ?? []) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    }

    return grouped;
  }, [data?.tasks]);

  const accentByStatus = Object.fromEntries(
    kanbanColumns.map((column) => [column.status, column.accentClass]),
  ) as Record<TaskStatus, string>;

  const users = data?.household?.users ?? [];
  const currentUserId = data?.me?.id;

  const handleAddTask = useCallback(
    async (status: TaskStatus) => {
      await createTask({
        variables: {
          input: {
            title: "Untitled",
            status,
            priority: "LOW",
            assigneeIds: currentUserId ? [currentUserId] : undefined,
            isShared: true,
          },
        },
      });
    },
    [createTask, currentUserId],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      setActiveWidth(null);
      return;
    }

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const currentStatus = active.data.current?.status as TaskStatus | undefined;

    if (!currentStatus || currentStatus === newStatus) {
      setActiveTask(null);
      setActiveWidth(null);
      return;
    }

    const task = data?.tasks.find((item) => item.id === taskId);
    if (!task) {
      setActiveTask(null);
      setActiveWidth(null);
      return;
    }

    void moveTask({
      variables: { id: taskId, status: newStatus },
      optimisticResponse: {
        moveTask: {
          __typename: "Task",
          ...task,
          status: newStatus,
        },
      },
    });
    setActiveTask(null);
    setActiveWidth(null);
  }

  function handleDragCancel() {
    setActiveTask(null);
    setActiveWidth(null);
  }

  return (
    <TasksPageLayout>
      {loading && <p className="text-sm text-text-muted">Loading board…</p>}
      {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

      {!loading && !error && (
        <DndContext
          sensors={sensors}
          onDragStart={(event) => {
            const task = data?.tasks.find((item: BoardTask) => item.id === event.active.id);
            setActiveTask(task ?? null);
            setActiveWidth(event.active.rect.current.initial?.width ?? null);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((column) => (
              <KanbanColumnView
                key={column.status}
                column={column}
                tasks={tasksByStatus[column.status] ?? []}
                users={users}
                collapsed={column.collapsible ? doneCollapsed : false}
                onToggleCollapsed={
                  column.collapsible ? () => setDoneCollapsed((value) => !value) : undefined
                }
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdate}
                onDeleteTask={handleDelete}
              />
            ))}
          </div>
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
        </DndContext>
      )}
    </TasksPageLayout>
  );
}
