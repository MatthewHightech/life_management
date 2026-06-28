"use client";

import { Chip } from "@/components/ui/chip";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { useAsyncAction } from "@/hooks/use-async-action";
import { usePopoverAnchor } from "@/hooks/use-popover-anchor";
import { cn } from "@/lib/cn";

export type PillSelectOption<T extends string> = {
  value: T;
  label: string;
  chipClassName: string;
};

type PillSelectProps<T extends string> = {
  value: T;
  triggerLabel: string;
  triggerChipClassName: string;
  options: PillSelectOption<T>[];
  onSelect: (value: T) => Promise<void> | void;
};

export function PillSelect<T extends string>({
  value,
  triggerLabel,
  triggerChipClassName,
  options,
  onSelect,
}: PillSelectProps<T>) {
  const { open, anchorRef, toggle, close, triggerClassName } = usePopoverAnchor();
  const { pending, run } = useAsyncAction(onSelect);

  async function handleSelect(next: T) {
    close();
    if (next === value) {
      return;
    }
    await run(next);
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        disabled={pending}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={toggle}
        className={triggerClassName("rounded-md px-1 py-0.5")}
      >
        <Chip className={cn("whitespace-nowrap", triggerChipClassName)}>{triggerLabel}</Chip>
      </button>

      <FloatingPanel open={open} anchorRef={anchorRef} onClose={close} className="p-1.5">
        <div role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => void handleSelect(option.value)}
              className="flex w-full items-center rounded-md px-2 py-1.5 text-left transition hover:opacity-70"
            >
              <Chip className={option.chipClassName}>{option.label}</Chip>
            </button>
          ))}
        </div>
      </FloatingPanel>
    </>
  );
}
