"use client";

import { useDraggable, useDndMonitor, useDroppable } from "@dnd-kit/core";
import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTaskBoards, type TaskBoard } from "@/components/tasks/task-boards-context";
import { Button } from "@/components/ui/button";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { defaultBoardMoveTarget } from "@/lib/task-boards";

export function TaskBoardBar() {
  const {
    boards,
    boardsLoading,
    boardsError,
    displayedBoardId,
    editingBoardId,
    setEditingBoardId,
    setActiveBoardId,
    createBoard,
    creatingBoard,
    renameBoard,
    deleteBoard,
    deletingBoard,
  } = useTaskBoards();
  const [pendingDelete, setPendingDelete] = useState<TaskBoard | null>(null);
  const [destinationId, setDestinationId] = useState<string>("");
  const suppressClickRef = useRef(false);

  useDndMonitor({
    onDragStart() {
      suppressClickRef.current = true;
    },
    onDragEnd() {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    },
    onDragCancel() {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    },
  });

  const others = pendingDelete ? boards.filter((board) => board.id !== pendingDelete.id) : [];

  function openDelete(board: TaskBoard) {
    const destination = defaultBoardMoveTarget(boards, board.id);
    setDestinationId(destination?.id ?? "");
    setPendingDelete(board);
  }

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto">
        {boardsLoading && boards.length === 0 ? (
          <span className="px-2 py-1.5 text-sm text-text-muted">Loading boards…</span>
        ) : null}
        {boards.map((board) => (
          <BoardTab
            key={board.id}
            board={board}
            selected={board.id === displayedBoardId}
            editing={board.id === editingBoardId}
            canDelete={boards.length > 1}
            suppressClickRef={suppressClickRef}
            onSelect={() => setActiveBoardId(board.id)}
            onEdit={() => setEditingBoardId(board.id)}
            onRename={(name) => void renameBoard(board.id, name)}
            onDelete={() => openDelete(board)}
          />
        ))}
        <button
          type="button"
          onClick={() => void createBoard()}
          disabled={creatingBoard || boardsLoading}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-background disabled:opacity-50"
          aria-label="Add board"
          title="Add board"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {boardsError ? <p className="mt-1 text-sm text-error">Could not load boards: {boardsError}</p> : null}

      <Modal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingBoard) {
            setPendingDelete(null);
          }
        }}
        title={pendingDelete ? `Delete “${pendingDelete.name}”?` : "Delete board?"}
        description={
          pendingDelete && pendingDelete.taskCount > 0
            ? pendingDelete.taskCount === 1
              ? "This board has 1 task."
              : `This board has ${pendingDelete.taskCount} tasks.`
            : "This board has no tasks."
        }
      >
        {pendingDelete && pendingDelete.taskCount > 0 && others.length > 0 ? (
          <label className="mb-4 block text-sm text-text-main">
            Move tasks to
            <select
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm"
            >
              {others.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={deletingBoard} onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          {pendingDelete && pendingDelete.taskCount > 0 ? (
            <Button
              type="button"
              variant="secondary"
              disabled={deletingBoard || !destinationId}
              onClick={() => {
                const board = pendingDelete;
                void deleteBoard(board.id, destinationId).then(
                  () => setPendingDelete(null),
                  () => undefined,
                );
              }}
            >
              {deletingBoard ? "Moving…" : "Move tasks"}
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={deletingBoard || !pendingDelete}
            className="bg-error text-white hover:bg-error/90"
            onClick={() => {
              if (!pendingDelete) {
                return;
              }
              void deleteBoard(pendingDelete.id, null).then(
                () => setPendingDelete(null),
                () => undefined,
              );
            }}
          >
            {deletingBoard ? "Deleting…" : pendingDelete && pendingDelete.taskCount > 0 ? "Delete tasks" : "Delete board"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function BoardTab({
  board,
  selected,
  editing,
  canDelete,
  suppressClickRef,
  onSelect,
  onEdit,
  onRename,
  onDelete,
}: {
  board: TaskBoard;
  selected: boolean;
  editing: boolean;
  canDelete: boolean;
  suppressClickRef: React.MutableRefObject<boolean>;
  onSelect: () => void;
  onEdit: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const menuAnchorRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `tab:${board.id}`,
    data: { type: "board", boardId: board.id },
    disabled: editing,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `board:${board.id}`,
    data: { type: "board", boardId: board.id },
  });

  function setRefs(node: HTMLDivElement | null) {
    setDragRef(node);
    setDropRef(node);
  }

  return (
    <div
      ref={setRefs}
      {...listeners}
      {...attributes}
      role="tab"
      aria-selected={selected}
      onClick={() => {
        if (suppressClickRef.current || editing) {
          return;
        }
        onSelect();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        onEdit();
      }}
      className={cn(
        "flex shrink-0 cursor-grab items-center gap-0.5 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap active:cursor-grabbing",
        selected ? "bg-muted-blue font-medium text-secondary" : "text-text-muted hover:bg-background",
        isOver && "ring-2 ring-secondary",
        isDragging && "opacity-60",
      )}
    >
      {editing ? (
        <BoardNameInput initial={board.name} onCommit={onRename} onCancel={() => onRename(board.name)} />
      ) : (
        <span className="max-w-[14rem] truncate">{board.name}</span>
      )}
      <button
        ref={menuAnchorRef}
        type="button"
        aria-label={`${board.name} options`}
        className="rounded p-0.5 hover:bg-black/5"
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setMenuOpen((open) => !open);
        }}
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <FloatingPanel
        open={menuOpen}
        anchorRef={menuAnchorRef}
        onClose={() => setMenuOpen(false)}
        minWidth={180}
        align="start"
        matchAnchorWidth={false}
        className="p-1"
      >
        <button
          type="button"
          disabled={!canDelete}
          title={canDelete ? undefined : "At least one board is required"}
          className="block w-full rounded-md px-3 py-2 text-left text-sm text-error hover:bg-background disabled:cursor-not-allowed disabled:text-text-muted disabled:hover:bg-transparent"
          onClick={() => {
            setMenuOpen(false);
            if (canDelete) {
              onDelete();
            }
          }}
        >
          Delete
        </button>
      </FloatingPanel>
    </div>
  );
}

function BoardNameInput({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      defaultValue={initial}
      aria-label="Board name"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onCommit(event.currentTarget.value);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          cancelRef.current = true;
          onCancel();
        }
      }}
      onBlur={(event) => {
        if (cancelRef.current) {
          cancelRef.current = false;
          return;
        }
        onCommit(event.currentTarget.value);
      }}
      className="w-[9rem] bg-transparent text-sm font-medium text-secondary outline-none"
    />
  );
}
