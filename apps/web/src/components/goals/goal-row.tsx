"use client";

import { Check, Trash2 } from "lucide-react";
import { EditableTextCell } from "@/components/editable-table";
import { cn } from "@/lib/cn";

export type GoalRowData = {
  id: string;
  title: string;
  completedAt?: string | null;
};

type GoalRowProps = {
  goal: GoalRowData;
  editable: boolean;
  onToggleComplete?: (completed: boolean) => Promise<void>;
  onRename?: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function GoalRow({ goal, editable, onToggleComplete, onRename, onDelete }: GoalRowProps) {
  const completed = Boolean(goal.completedAt);

  return (
    <div className="group flex items-start gap-2 py-1.5">
      <button
        type="button"
        disabled={!editable || !onToggleComplete}
        onClick={() => void onToggleComplete?.(!completed)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
          completed
            ? "border-status-done bg-status-done text-on-primary"
            : "border-border-subtle bg-surface text-transparent",
          editable && onToggleComplete && !completed && "hover:border-status-done",
          (!editable || !onToggleComplete) && "cursor-default opacity-80",
        )}
        aria-label={completed ? `Mark ${goal.title} incomplete` : `Complete ${goal.title}`}
      >
        <Check className="h-3 w-3" />
      </button>

      {editable && onRename ? (
        <EditableTextCell
          value={goal.title}
          onSave={onRename}
          className={cn("min-w-0 flex-1 font-medium", completed && "text-text-muted line-through")}
          wrap
        />
      ) : (
        <span
          className={cn(
            "min-w-0 flex-1 text-sm font-medium text-text-main",
            completed && "text-text-muted line-through",
          )}
        >
          {goal.title}
        </span>
      )}

      {editable && onDelete ? (
        <button
          type="button"
          onClick={() => void onDelete()}
          className="mt-0.5 rounded p-1 text-text-muted opacity-0 transition hover:bg-background hover:text-error group-hover:opacity-100"
          aria-label={`Delete ${goal.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
