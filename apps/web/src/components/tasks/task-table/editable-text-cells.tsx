"use client";

import { inlineFieldInputClass, inlineFieldTriggerClass, inlineTextareaClass } from "@/lib/inline-edit-styles";
import { truncateText } from "@/lib/truncate";
import { cn } from "@/lib/cn";
import { useTextInlineEdit } from "./use-text-inline-edit";

const DESCRIPTION_MAX_LENGTH = 100;

type EditableTextProps = {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
};

export function EditableText({ value, onSave, className, inputClassName, placeholder }: EditableTextProps) {
  const { editing, setEditing, draft, setDraft, pending, commit, cancel } = useTextInlineEdit({
    value,
    onSave,
    resolveCommit: (draftValue) => {
      const trimmed = draftValue.trim();
      if (!trimmed || trimmed === value) {
        return null;
      }
      return trimmed;
    },
  });

  if (editing) {
    return (
      <input
        autoFocus
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
        className={cn(inlineFieldInputClass, inputClassName)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(inlineFieldTriggerClass, className)}
    >
      {value}
    </button>
  );
}

type EditableDescriptionProps = {
  value?: string | null;
  onSave: (value: string | null) => Promise<void>;
  maxLength?: number;
  className?: string;
};

export function EditableDescription({
  value,
  onSave,
  maxLength = DESCRIPTION_MAX_LENGTH,
  className,
}: EditableDescriptionProps) {
  const displayValue = value ?? "";
  const { editing, setEditing, draft, setDraft, pending, commit, cancel } = useTextInlineEdit({
    value: displayValue,
    onSave,
    resolveCommit: (draftValue) => {
      const next = draftValue.trim() || null;
      const current = value?.trim() || null;
      if (next === current) {
        return null;
      }
      return next;
    },
  });

  if (editing) {
    return (
      <textarea
        autoFocus
        rows={3}
        value={draft}
        disabled={pending}
        placeholder="Add a description…"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            cancel();
          }
        }}
        className={inlineTextareaClass}
      />
    );
  }

  return (
    <button
      type="button"
      title={value ?? undefined}
      onClick={() => setEditing(true)}
      className={cn(
        inlineFieldTriggerClass,
        value ? "text-text-muted" : "text-text-muted/70 italic",
        className,
      )}
    >
      {truncateText(value, maxLength)}
    </button>
  );
}
