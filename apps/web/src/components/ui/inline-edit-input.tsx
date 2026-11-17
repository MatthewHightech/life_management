"use client";

import type { ComponentProps } from "react";
import type { useTextInlineEdit } from "@/hooks/use-text-inline-edit";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";

type InlineEdit = Pick<
  ReturnType<typeof useTextInlineEdit>,
  "draft" | "setDraft" | "pending" | "commit" | "cancel"
>;

type InlineEditInputProps = Omit<
  ComponentProps<"input">,
  "value" | "disabled" | "onChange" | "onBlur" | "onKeyDown"
> & {
  edit: InlineEdit;
};

export function InlineEditInput({ edit, className, ...props }: InlineEditInputProps) {
  return (
    <input
      {...props}
      value={edit.draft}
      disabled={edit.pending}
      onChange={(event) => edit.setDraft(event.target.value)}
      onBlur={() => void edit.commit()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void edit.commit();
        }
        if (event.key === "Escape") {
          edit.cancel();
        }
      }}
      className={cn(inlineFieldInputClass, className)}
    />
  );
}
