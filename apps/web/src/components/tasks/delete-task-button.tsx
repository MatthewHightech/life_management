"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type DeleteTaskButtonProps = {
  taskTitle: string;
  onConfirm: () => void;
  className?: string;
  variant?: "text" | "icon";
};

export function DeleteTaskButton({
  taskTitle,
  onConfirm,
  className,
  variant = "text",
}: DeleteTaskButtonProps) {
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    onConfirm();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label={`Delete ${taskTitle}`}
      >
        {variant === "icon" ? <Trash2 className="h-3.5 w-3.5" /> : "Delete"}
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete task?"
        description={`"${taskTitle}" will be permanently removed.`}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
