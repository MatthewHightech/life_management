"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { GearCondition } from "@/components/gear/types";
import { gearConditionSelectOptions } from "@/components/gear/gear-condition-select";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const fieldInputClass = "w-full rounded-lg border border-border-subtle bg-background px-3 py-2";

export function useGearFormValues<S, T>(open: boolean, source: S, toValues: (source: S) => T) {
  const [values, setValues] = useState(() => toValues(source));

  useEffect(() => {
    if (open) {
      setValues(toValues(source));
    }
  }, [open, source, toValues]);

  const setField = useCallback(
    <K extends keyof T>(key: K) =>
      (value: T[K]) =>
        setValues((current) => ({ ...current, [key]: value })),
    [],
  );

  return { values, setField };
}

function GearField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-text-muted">{label}</span>
      {children}
    </label>
  );
}

type GearTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "email";
};

export function GearTextField({ label, value, onChange, required, multiline, type }: GearTextFieldProps) {
  return (
    <GearField label={label}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className={fieldInputClass}
        />
      ) : (
        <input
          required={required}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldInputClass}
        />
      )}
    </GearField>
  );
}

export function GearConditionField({
  value,
  onChange,
}: {
  value: GearCondition;
  onChange: (value: GearCondition) => void;
}) {
  return (
    <GearField label="Condition">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as GearCondition)}
        className={fieldInputClass}
      >
        {gearConditionSelectOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </GearField>
  );
}

type GearFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  loading: boolean;
  fallbackError: string;
  onSubmit: () => Promise<void>;
  children: ReactNode;
};

export function GearFormModal({
  open,
  onOpenChange,
  title,
  submitLabel,
  loading,
  fallbackError,
  onSubmit,
  children,
}: GearFormModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  async function handleSubmit() {
    setError(null);
    try {
      await onSubmit();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : fallbackError);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} className="w-[min(100%-2rem,36rem)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        className="space-y-3"
      >
        {children}
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
