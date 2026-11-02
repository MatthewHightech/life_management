"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { GOAL_CADENCE_LABELS, GOAL_LIMITS, type GoalCadence } from "@life/shared";
import { GoalRow, type GoalRowData } from "@/components/goals/goal-row";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type GoalCadenceSectionProps = {
  cadence: GoalCadence;
  label?: string | null;
  goals: GoalRowData[];
  isOwner: boolean;
  onAdd?: (title: string) => Promise<void>;
  onToggleComplete?: (goalId: string, completed: boolean) => Promise<void>;
  onRename?: (goalId: string, title: string) => Promise<void>;
  onDelete?: (goalId: string) => Promise<void>;
  onReset?: () => Promise<void>;
  readOnly?: boolean;
};

export function GoalCadenceSection({
  cadence,
  label,
  goals,
  isOwner,
  onAdd,
  onToggleComplete,
  onRename,
  onDelete,
  onReset,
  readOnly = false,
}: GoalCadenceSectionProps) {
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const limit = GOAL_LIMITS[cadence];
  const canAdd = isOwner && !readOnly && Boolean(onAdd) && goals.length < limit;

  async function submitDraft() {
    const title = draft.trim();
    if (!title || !onAdd) {
      return;
    }
    setSaving(true);
    try {
      await onAdd(title);
      setDraft("");
      setDraftOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-border-subtle bg-surface">
      <header className="flex items-center justify-between gap-2 rounded-t-lg bg-muted-blue px-3 py-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-secondary">{GOAL_CADENCE_LABELS[cadence]}</h3>
          {label ? <p className="truncate text-xs text-text-muted">{label}</p> : null}
        </div>
        <span className="shrink-0 text-xs text-text-muted">
          {readOnly
            ? `${goals.filter((goal) => goal.completedAt).length}/${goals.length}`
            : `${goals.length}/${limit}`}
        </span>
      </header>

      <div className="space-y-0.5 px-3 py-2">
        {goals.length === 0 ? (
          <p className="py-2 text-xs text-text-muted">No goals yet.</p>
        ) : (
          goals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              editable={isOwner && !readOnly}
              onToggleComplete={
                onToggleComplete ? (completed) => onToggleComplete(goal.id, completed) : undefined
              }
              onRename={onRename ? (title) => onRename(goal.id, title) : undefined}
              onDelete={onDelete ? () => onDelete(goal.id) : undefined}
            />
          ))
        )}

        {draftOpen ? (
          <form
            className="flex gap-2 py-1"
            onSubmit={(event) => {
              event.preventDefault();
              void submitDraft();
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Goal title"
              className="min-w-0 flex-1 rounded-md border border-border-subtle bg-background px-2 py-1.5 text-sm outline-none focus:border-primary-container"
              disabled={saving}
            />
            <Button type="submit" className="px-2.5 py-1.5 text-xs" disabled={saving || !draft.trim()}>
              Add
            </Button>
          </form>
        ) : null}
      </div>

      {isOwner && !readOnly ? (
        <footer className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-3 py-2">
          {canAdd ? (
            <Button
              type="button"
              className="gap-1.5 px-3 py-1.5 text-xs"
              onClick={() => setDraftOpen(true)}
              disabled={draftOpen}
            >
              <Plus className="h-4 w-4" />
              Add goal
            </Button>
          ) : null}
          {onReset && goals.length > 0 ? (
            <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setResetOpen(true)}>
              Reset
            </Button>
          ) : null}
        </footer>
      ) : null}

      {onReset ? (
        <ConfirmModal
          open={resetOpen}
          onOpenChange={setResetOpen}
          title={`Reset ${GOAL_CADENCE_LABELS[cadence].toLowerCase()}?`}
          description="These goals move to Past Goals. Current goals for this cadence will be cleared."
          confirmLabel="Reset goals"
          loading={resetting}
          onConfirm={async () => {
            setResetting(true);
            try {
              await onReset();
              setResetOpen(false);
            } finally {
              setResetting(false);
            }
          }}
        />
      ) : null}
    </section>
  );
}
