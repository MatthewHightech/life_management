"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type FloatingPanelProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
};

const PANEL_GAP_PX = 4;

function useFloatingPanelPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
  children: React.ReactNode,
) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setCoords(null);
      return;
    }

    function updatePosition() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const panelHeight = panel?.offsetHeight ?? 0;
      const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP_PX;
      const spaceAbove = rect.top - PANEL_GAP_PX;
      const showAbove = panelHeight > spaceBelow && spaceAbove > spaceBelow;

      setCoords({
        left: rect.left,
        top: showAbove ? rect.top - panelHeight - PANEL_GAP_PX : rect.bottom + PANEL_GAP_PX,
      });
    }

    updatePosition();

    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef, panelRef, children]);

  return coords;
}

function useDismissFloatingPanel(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef, panelRef]);
}

export function FloatingPanel({
  open,
  anchorRef,
  onClose,
  children,
  className,
  minWidth = 160,
}: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const coords = useFloatingPanelPosition(open, anchorRef, panelRef, children);

  useDismissFloatingPanel(open, anchorRef, panelRef, onClose);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const anchorWidth = anchorRef.current?.getBoundingClientRect().width ?? minWidth;

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: coords?.top ?? -9999,
        left: coords?.left ?? 0,
        minWidth: Math.max(minWidth, anchorWidth),
        visibility: coords ? "visible" : "hidden",
      }}
      className={cn("z-50 rounded-lg border border-border-subtle bg-surface shadow-lg", className)}
    >
      {children}
    </div>,
    document.body,
  );
}
