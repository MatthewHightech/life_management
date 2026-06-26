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
import { useMemo, useState } from "react";
import type { TaskStatus, TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import {
  MOVE_TASK_MUTATION,
  TASKS_BOARD_QUERY,
} from "@/graphql";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { KanbanCard } from "@/components/tasks/kanban-card";
import { KanbanColumnView } from "@/components/tasks/kanban-column";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { kanbanColumns } from "@/lib/task-status";

type BoardTask = TasksBoardQuery["tasks"][number];

export function KanbanBoard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");
  const [doneCollapsed, setDoneCollapsed] = useState(true);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);

  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: { filter: { view: "KANBAN", includeDone: true } },
  });

  const [moveTask] = useMutation(MOVE_TASK_MUTATION, {
    refetchQueries: [{ query: TASKS_BOARD_QUERY, variables: { filter: { view: "KANBAN", includeDone: true } } }],
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

  function openCreate(status: TaskStatus = "TODO") {
    setCreateStatus(status);
    setCreateOpen(true);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const currentStatus = active.data.current?.status as TaskStatus | undefined;

    if (!currentStatus || currentStatus === newStatus) {
      return;
    }

    await moveTask({ variables: { id: taskId, status: newStatus } });
  }

  return (
    <>
      <TasksHeader onNewTask={() => openCreate("TODO")} />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        {loading && <p className="text-sm text-text-muted">Loading board…</p>}
        {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

        {!loading && !error && (
          <DndContext
            sensors={sensors}
            onDragStart={(event) => {
              const task = data?.tasks.find((item: BoardTask) => item.id === event.active.id);
              setActiveTask(task ?? null);
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTask(null)}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {kanbanColumns.map((column) => (
                <KanbanColumnView
                  key={column.status}
                  column={column}
                  tasks={tasksByStatus[column.status] ?? []}
                  collapsed={column.collapsible ? doneCollapsed : false}
                  onToggleCollapsed={
                    column.collapsible ? () => setDoneCollapsed((value) => !value) : undefined
                  }
                  onAddTask={openCreate}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <KanbanCard task={activeTask} accentClass={accentByStatus[activeTask.status]} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        users={data?.household?.users ?? []}
        defaultStatus={createStatus}
      />
    </>
  );
}
