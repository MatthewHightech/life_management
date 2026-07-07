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

  const fieldShellClass = "w-full min-w-0 overflow-hidden";

  if (disabled) {
    return (
      <span
        className={cn(
          "block min-h-7 truncate px-2 py-0.5 text-sm",
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
          inlineFieldTriggerClass,
          "max-w-full truncate",
          !value && displayPlaceholder && "text-text-muted/70 italic",
          className,
        )}
      >
        {value || displayPlaceholder || placeholder || ""}
      </button>
    </div>
  );
}
