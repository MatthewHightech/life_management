"use client";

import { formatShortDate, startOfDay } from "@life/shared";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { usePopoverAnchor } from "@/hooks/use-popover-anchor";

type BudgetPurchaseDatePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
  disabled?: boolean;
};

export function BudgetPurchaseDatePicker({ value, onChange, disabled }: BudgetPurchaseDatePickerProps) {
  const { open, anchorRef, toggle, close, triggerClassName } = usePopoverAnchor();

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={triggerClassName(
          "inline-flex min-h-7 items-center rounded-md px-2 py-0.5 text-sm text-text-main",
        )}
      >
        {formatShortDate(value)}
      </button>

      <FloatingPanel
        open={open}
        anchorRef={anchorRef}
        onClose={close}
        minWidth={256}
        align="end"
        className="p-0"
      >
        <CalendarPicker
          value={value}
          onSelect={(date) => {
            close();
            onChange(startOfDay(date));
          }}
        />
      </FloatingPanel>
    </>
  );
}
