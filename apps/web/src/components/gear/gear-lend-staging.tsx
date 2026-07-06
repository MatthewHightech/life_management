"use client";

import { useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";
import { FormEvent, forwardRef, useState } from "react";
import type { StagedGearEntry } from "@/components/gear/types";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import { Button } from "@/components/ui/button";
import { GEAR_LEND_ZONE } from "@life/shared";
import { cn } from "@/lib/cn";

type GearLendStagingProps = {
  staged: StagedGearEntry[];
  lending: boolean;
  onRemove: (entry: StagedGearEntry) => void;
  onLend: (input: {
    borrowerName: string;
    borrowerEmail: string;
    lentAt: string;
    returnBy: string;
  }) => Promise<void>;
};

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const GearLendStaging = forwardRef<HTMLElement, GearLendStagingProps>(function GearLendStaging(
  { staged, lending, onRemove, onLend },
  ref,
) {
  const { setNodeRef, isOver } = useDroppable({
    id: GEAR_LEND_ZONE,
    data: { zone: GEAR_LEND_ZONE },
  });

  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [lentAt, setLentAt] = useState(todayInputValue);
  const [returnBy, setReturnBy] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await onLend({ borrowerName, borrowerEmail, lentAt, returnBy });
      setBorrowerName("");
      setBorrowerEmail("");
      setLentAt(todayInputValue());
      setReturnBy("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create loan.");
    }
  }

  return (
    <section ref={ref} className="rounded-xl border border-border-subtle bg-surface">
      <header className="border-b border-border-subtle bg-muted-blue/30 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Lend staging</h2>
        <p className="mt-1 text-xs text-text-muted">
          Drag standalone items or variants here, then complete the lend form.
        </p>
      </header>

      <div className="space-y-4 p-4">
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-24 rounded-lg border-2 border-dashed p-3 transition-colors",
            isOver ? "border-muted-blue bg-muted-blue/10" : "border-border-subtle bg-background",
          )}
        >
          {staged.length === 0 ? (
            <p className="text-sm text-text-muted">Drop gear items or variants to stage a loan.</p>
          ) : (
            <ul className="space-y-2">
              {staged.map((entry) => (
                <li
                  key={`${entry.kind}:${entry.id}`}
                  className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-2 py-1.5"
                >
                  <GearPhotoThumb
                    kind={entry.kind}
                    id={entry.id}
                    hasPhoto={entry.hasPhoto}
                    alt={entry.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-main">{entry.name}</p>
                    {entry.kind === "variant" ? (
                      <p className="truncate text-xs text-text-muted">{entry.className}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(entry)}
                    className="rounded p-1 text-text-muted hover:bg-background hover:text-text-main"
                    aria-label={`Remove ${entry.name} from staging`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Borrower name</span>
            <input
              required
              value={borrowerName}
              onChange={(event) => setBorrowerName(event.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Borrower email</span>
            <input
              required
              type="email"
              value={borrowerEmail}
              onChange={(event) => setBorrowerEmail(event.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Lent date</span>
            <input
              required
              type="date"
              value={lentAt}
              onChange={(event) => setLentAt(event.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Return by</span>
            <input
              required
              type="date"
              value={returnBy}
              onChange={(event) => setReturnBy(event.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>
          {error ? <p className="text-sm text-error md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={lending || staged.length === 0}>
              {lending ? "Creating loan…" : "Lend staged items"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
});
