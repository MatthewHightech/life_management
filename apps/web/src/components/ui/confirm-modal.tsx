"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  loadingLabel,
  loading = false,
  destructive = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={loading}
          className={cn(destructive && "bg-error text-white hover:bg-error/90")}
          onClick={() => void onConfirm()}
        >
          {loading && loadingLabel ? loadingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
