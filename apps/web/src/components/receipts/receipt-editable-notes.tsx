"use client";

import { useMutation } from "@apollo/client";
import { useEffect, useRef } from "react";
import { UPDATE_RECEIPT_NOTES_MUTATION } from "@/graphql";
import { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { inlineFieldTriggerClass, inlineTextareaClass } from "@/lib/inline-edit-styles";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/receipt-queries";
import { cn } from "@/lib/cn";

type ReceiptEditableNotesProps = {
  receiptId: string;
  notes?: string | null;
};

export function ReceiptEditableNotes({ receiptId, notes }: ReceiptEditableNotesProps) {
  const [updateNotes] = useMutation(UPDATE_RECEIPT_NOTES_MUTATION, {
    refetchQueries: [...RECEIPT_LIBRARY_REFETCH],
    awaitRefetchQueries: true,
  });

  const displayValue = notes ?? "";
  const { editing, setEditing, draft, setDraft, pending, commit, cancel } = useTextInlineEdit<string | null>({
    value: displayValue,
    onSave: async (value) => {
      await updateNotes({
        variables: { id: receiptId, notes: value },
      });
    },
    resolveCommit: (draftValue) => {
      const next = draftValue.trim() || null;
      const current = notes?.trim() || null;
      if (next === current) {
        return null;
      }
      return next;
    },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) {
      return;
    }
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }, [editing]);

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        rows={3}
        value={draft}
        disabled={pending}
        placeholder="Add notes…"
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
      title={notes ?? undefined}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setEditing(true)}
      className={cn(
        inlineFieldTriggerClass,
        "block min-h-7 whitespace-pre-wrap break-words text-left",
        notes ? "text-text-muted" : "text-text-muted/70 italic",
      )}
    >
      {notes?.trim() ? notes : "Add notes…"}
    </button>
  );
}
