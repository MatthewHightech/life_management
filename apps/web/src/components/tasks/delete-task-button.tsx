"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/cn";

type DeleteTaskButtonProps = {
  taskTitle: string;
  onConfirm: () => void;
  variant?: "icon" | "labeled";
  className?: string;
};

export function DeleteTaskButton({
  taskTitle,
  onConfirm,
  variant = "icon",
  className,
}: DeleteTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "labeled" ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen(true)}
          className={cn("gap-1.5 px-3 py-1.5 text-xs text-error hover:text-error", className)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete task
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("rounded p-0.5 text-text-muted hover:text-error", className)}
          aria-label={`Delete ${taskTitle}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

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
