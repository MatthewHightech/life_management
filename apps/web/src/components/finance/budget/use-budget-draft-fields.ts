"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { parseCadInputToCents } from "@life/shared";
import { focusLeavesRow } from "@/lib/focus-utils";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";

const draftInputClass = cn(inlineFieldInputClass, "max-w-full min-w-0");

type BudgetDraftFieldsOptions = {
  namePlaceholder: string;
  disabled: boolean;
  onSubmit: (draft: { name: string; amountCents: number }) => Promise<void>;
  onCancel: () => void;
};

export function useBudgetDraftFields<TRow extends HTMLElement>({
  namePlaceholder,
  disabled,
  onSubmit,
  onCancel,
}: BudgetDraftFieldsOptions) {
  const rowRef = useRef<TRow>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const committingRef = useRef(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function commit() {
    if (committingRef.current) return;

    const trimmedName = name.trim();
    const amountCents = parseCadInputToCents(amount);
    if (!trimmedName || amountCents === null) {
      onCancel();
      return;
    }

    committingRef.current = true;
    try {
      await onSubmit({ name: trimmedName, amountCents });
    } catch {
      committingRef.current = false;
    }
  }

  const sharedInputProps = {
    disabled,
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      if (focusLeavesRow(event, rowRef.current)) {
        void commit();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void commit();
      }
      if (event.key === "Escape") {
        onCancel();
      }
    },
  };

  return {
    rowRef,
    nameInputProps: {
      ...sharedInputProps,
      ref: nameRef,
      value: name,
      placeholder: namePlaceholder,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
      className: draftInputClass,
    },
    amountInputProps: {
      ...sharedInputProps,
      value: amount,
      placeholder: "$0.00",
      onChange: (event: ChangeEvent<HTMLInputElement>) => setAmount(event.target.value),
      className: cn(draftInputClass, "text-right tabular-nums"),
    },
  };
}
