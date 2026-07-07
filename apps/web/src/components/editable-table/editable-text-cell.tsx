"use client";

import { useEffect, useRef } from "react";
import { inlineFieldInputClass, inlineFieldTriggerClass } from "@/lib/inline-edit-styles";
import { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { cn } from "@/lib/cn";

type EditableTextCellProps = {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  displayPlaceholder?: string;
  startInEditMode?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  wrap?: boolean;
};

export function EditableTextCell({
  value,
  onSave,
  className,
  inputClassName,
  placeholder,
  displayPlaceholder,
  startInEditMode = false,
  allowClear = false,
  disabled = false,
  wrap = false,
}: EditableTextCellProps) {
  const { editing, setEditing, draft, setDraft, pending, commit, cancel } = useTextInlineEdit({
    value,
    onSave,
    resolveCommit: (draftValue) => {
      const trimmed = draftValue.trim();
      if (allowClear) {
        if (trimmed === value.trim()) {
          return null;
        }
        return trimmed;
      }
      if (!trimmed || trimmed === value) {
        return null;
      }
      return trimmed;
    },
  });

  const isEditing = !disabled && (editing || startInEditMode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, [isEditing]);

  const fieldShellClass = cn("w-full min-w-0", !wrap && "overflow-hidden");
  const displayTextClass = wrap ? "whitespace-normal break-words" : "truncate";
  const triggerClass = wrap
    ? "flex min-h-7 w-full items-start rounded-md px-2 py-1 text-left text-sm transition hover:bg-background"
    : inlineFieldTriggerClass;

  if (disabled) {
    return (
      <span
        className={cn(
          "block min-h-7 px-2 py-0.5 text-sm",
          displayTextClass,
          !value && displayPlaceholder && "text-text-muted/70 italic",
          className,
        )}
      >
        {value || displayPlaceholder || placeholder || ""}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className={fieldShellClass}>
        <input
          ref={inputRef}
          value={draft}
          disabled={pending}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void commit();
            }
            if (event.key === "Escape") {
              cancel();
            }
          }}
          className={cn(inlineFieldInputClass, "max-w-full min-w-0", inputClassName)}
        />
      </div>
    );
  }

  return (
    <div className={fieldShellClass}>
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setEditing(true)}
        className={cn(
          triggerClass,
          !wrap && "max-w-full",
          displayTextClass,
          !value && displayPlaceholder && "text-text-muted/70 italic",
          className,
        )}
      >
        {value || displayPlaceholder || placeholder || ""}
      </button>
    </div>
  );
}
