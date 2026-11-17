"use client";

import { cn } from "@/lib/cn";

export type SegmentedControlItem<T extends string = string> = {
  value: T;
  label: string;
};

type SegmentedControlSize = "sm" | "lg";

type SegmentedControlProps<T extends string> = {
  items: readonly SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  size?: SegmentedControlSize;
  "aria-label"?: string;
};

const sizeClasses: Record<
  SegmentedControlSize,
  { root: string; button: string }
> = {
  sm: {
    root: "inline-flex rounded-md p-0.5",
    button: "rounded px-1.5 py-0.5 text-xs",
  },
  lg: {
    root: "flex rounded-lg p-1",
    button: "flex-1 rounded-md px-2.5 py-1.5 text-sm",
  },
};

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  disabled = false,
  size = "sm",
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const classes = sizeClasses[size];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("border border-border-subtle bg-background", classes.root)}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "cursor-pointer",
              classes.button,
              active ? "bg-surface text-primary shadow-sm" : "text-text-muted",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
