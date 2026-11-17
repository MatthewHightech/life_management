"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function usePopoverAnchor() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return {
    open,
    anchorRef,
    toggle: () => setOpen((current) => !current),
    close: () => setOpen(false),
    triggerClassName: (className?: string) =>
      cn("transition hover:opacity-70 disabled:opacity-60", className),
  };
}
