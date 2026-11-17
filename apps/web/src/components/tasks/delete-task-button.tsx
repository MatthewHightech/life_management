"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type DeleteTaskButtonProps = {
  taskTitle: string;
  onConfirm: () => void;
};

export function DeleteTaskButton({ taskTitle, onConfirm }: DeleteTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded p-0.5 text-text-muted hover:text-error"
        aria-label={`Delete ${taskTitle}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="Delete task?"
        description={`"${taskTitle}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => {
          onConfirm();
          setOpen(false);
        }}
      />
    </>
  );
}
