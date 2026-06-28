"use client";

import { useEffect, useState } from "react";
import { useAsyncAction } from "@/hooks/use-async-action";

type UseTextInlineEditOptions<TCommit> = {
  value: string;
  onSave: (value: TCommit) => Promise<void>;
  resolveCommit: (draft: string) => TCommit | null;
};

export function useTextInlineEdit<TCommit>({
  value,
  onSave,
  resolveCommit,
}: UseTextInlineEditOptions<TCommit>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const { pending, run } = useAsyncAction(onSave);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  async function commit() {
    const next = resolveCommit(draft);
    if (next === null) {
      setDraft(value);
      setEditing(false);
      return;
    }

    await run(next);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  return {
    editing,
    setEditing,
    draft,
    setDraft,
    pending,
    commit,
    cancel,
  };
}
