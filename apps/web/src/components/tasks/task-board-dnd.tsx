"use client";

import {
  DndContext,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createContext, useContext, useEffect, useRef } from "react";
import { useTaskBoards } from "@/components/tasks/task-boards-context";

type TaskDragHandlers = {
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
};

const TaskDragHandlerContext = createContext<React.MutableRefObject<TaskDragHandlers | null> | null>(null);

const collisionDetection: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);
  if (byPointer.length > 0) {
    const boardHit = byPointer.find((collision) => {
      const container = args.droppableContainers.find((item) => item.id === collision.id);
      return container?.data.current?.type === "board";
    });
    return boardHit ? [boardHit] : byPointer;
  }

  return rectIntersection(args);
};

export function useRegisterTaskDragHandlers(handlers: TaskDragHandlers) {
  const handlersRef = useContext(TaskDragHandlerContext);
  const { onDragStart, onDragEnd, onDragCancel } = handlers;

  useEffect(() => {
    if (!handlersRef) {
      return;
    }
    handlersRef.current = { onDragStart, onDragEnd, onDragCancel };
    return () => {
      handlersRef.current = null;
    };
  }, [handlersRef, onDragStart, onDragEnd, onDragCancel]);
}

function boardIdFromOver(over: DragOverEvent["over"] | DragEndEvent["over"]) {
  if (over?.data.current?.type === "board" && typeof over.data.current.boardId === "string") {
    return over.data.current.boardId;
  }
  return null;
}

export function TaskBoardDnd({ children }: { children: React.ReactNode }) {
  const handlersRef = useRef<TaskDragHandlers | null>(null);
  const { beginBoardDrag, hoverBoardDrag, finishBoardDrag, cancelBoardDrag, setPreviewBoardId } = useTaskBoards();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "board") {
      beginBoardDrag();
      return;
    }
    handlersRef.current?.onDragStart(event);
  }

  function handleDragOver(event: DragOverEvent) {
    const activeType = event.active.data.current?.type;
    if (activeType === "board") {
      const activeBoardId = event.active.data.current?.boardId;
      const overBoardId = boardIdFromOver(event.over);
      if (typeof activeBoardId === "string" && overBoardId) {
        hoverBoardDrag(activeBoardId, overBoardId);
      }
      return;
    }

    if (activeType === "task") {
      const overBoardId = boardIdFromOver(event.over);
      if (overBoardId) {
        setPreviewBoardId(overBoardId);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.active.data.current?.type === "board") {
      finishBoardDrag();
      return;
    }

    handlersRef.current?.onDragEnd(event);
    setPreviewBoardId(null);
  }

  function handleDragCancel() {
    cancelBoardDrag();
    handlersRef.current?.onDragCancel();
    setPreviewBoardId(null);
  }

  return (
    <TaskDragHandlerContext.Provider value={handlersRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </TaskDragHandlerContext.Provider>
  );
}
