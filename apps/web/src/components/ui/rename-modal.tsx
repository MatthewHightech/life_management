"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type RenameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  initialName: string;
  loading: boolean;
  onSubmit: (name: string) => Promise<unknown>;
};

export function RenameModal({
  open,
  onOpenChange,
  title,
  label,
  initialName,
  loading,
  onSubmit,
}: RenameModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      await onSubmit(trimmed);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} className="w-[min(100%-2rem,28rem)]">
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">{label}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            required
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
