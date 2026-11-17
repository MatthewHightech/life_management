"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const TRANSITION_MS = 300;

export function useSlideOverPresence<T>(item: T | null) {
  const [heldItem, setHeldItem] = useState<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (item) {
      setHeldItem(item);
      return;
    }
    const timer = window.setTimeout(() => setHeldItem(null), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [item]);

  useEffect(() => {
    if (item) {
      if (!wasOpenRef.current) {
        setIsVisible(false);
        const frame = requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsVisible(true));
        });
        wasOpenRef.current = true;
        return () => cancelAnimationFrame(frame);
      }
      return;
    }
    wasOpenRef.current = false;
    setIsVisible(false);
  }, [item]);

  return { panelItem: item ?? heldItem, isVisible };
}

type SlideOverPanelProps = {
  isVisible: boolean;
  onClose: () => void;
  closeLabel: string;
  className?: string;
  children: ReactNode;
};

export function SlideOverPanel({ isVisible, onClose, closeLabel, className, children }: SlideOverPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label={closeLabel}
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "relative flex h-full w-full flex-col border-l border-border-subtle bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.12)]",
          "transition-transform duration-300 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
        {children}
      </aside>
    </div>
  );
}
