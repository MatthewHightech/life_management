"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type DeleteTaskButtonProps = {
  taskTitle: string;
  onConfirm: () => void;
  className?: string;
};

export function DeleteTaskButton({ taskTitle, onConfirm, className }: DeleteTaskButtonProps) {
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    onConfirm();
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Delete
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
