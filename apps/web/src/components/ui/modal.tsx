"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  className?: string;
  /** Optional action seated to the left of the close control (e.g. Edit). */
  headerAction?: React.ReactNode;
  /** Override Radix auto-focus when the dialog opens (defaults to first focusable, often the close button). */
  onOpenAutoFocus?: (event: Event) => void;
  children: React.ReactNode;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  className,
  headerAction,
  onOpenAutoFocus,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content
          onOpenAutoFocus={onOpenAutoFocus}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex w-[min(100%-2rem,32rem)] max-h-[min(90dvh,40rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
            "rounded-xl border border-border-subtle bg-surface p-6 shadow-[0_12px_24px_rgba(0,0,0,0.1)]",
            className,
          )}
        >
          <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-semibold text-text-main">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerAction}
              <Dialog.Close className="rounded-lg p-1 text-text-muted hover:bg-background">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
