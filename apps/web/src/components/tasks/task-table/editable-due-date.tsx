"use client";

import { formatShortDate, parseOptionalDate, startOfDay, toIsoString } from "@life/shared";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { useAsyncAction } from "@/hooks/use-async-action";
import { usePopoverAnchor } from "@/hooks/use-popover-anchor";
import { cn } from "@/lib/cn";

type EditableDueDateProps = {
  value?: string | null;
  overdue: boolean;
  onSave: (value: string | null) => Promise<void>;
};

function toDueDateIso(date: Date): string | null {
  return toIsoString(startOfDay(date));
}

export function EditableDueDate({ value, overdue, onSave }: EditableDueDateProps) {
  const { open, anchorRef, toggle, close, triggerClassName } = usePopoverAnchor();
  const { pending, run } = useAsyncAction(onSave);
  const selectedDate = value ? parseOptionalDate(value) : null;

  async function persist(nextIso: string | null) {
    close();
    if (nextIso === (value ?? null)) {
      return;
    }
    await run(nextIso);
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        disabled={pending}
        onClick={toggle}
        className={triggerClassName(
          cn("inline-flex min-h-9 items-center rounded-md px-2 py-1 text-sm", overdue ? "font-medium text-error" : "text-text-muted"),
        )}
      >
        {value ? formatShortDate(value) : "Set date"}
      </button>

      <FloatingPanel open={open} anchorRef={anchorRef} onClose={close} minWidth={256} className="p-0">
        <CalendarPicker
          value={selectedDate}
          onSelect={(date) => void persist(toDueDateIso(date))}
          onClear={() => void persist(null)}
        />
      </FloatingPanel>
    </>
  );
}
