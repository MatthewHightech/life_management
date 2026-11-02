"use client";

import {
  GOAL_CADENCE_LABELS,
  GOAL_CADENCES,
  formatShortDate,
  type GoalCadence,
} from "@life/shared";
import { GoalCadenceSection } from "@/components/goals/goal-cadence-section";
import { Button } from "@/components/ui/button";
import type { PastGoalsQuery } from "@/graphql";

type GoalSet = PastGoalsQuery["pastGoals"]["daily"][number];

type PastGoalsArchiveProps = {
  daily: GoalSet[];
  weekly: GoalSet[];
  term: GoalSet[];
  hasMoreDaily: boolean;
  hasMoreWeekly: boolean;
  hasMoreTerm: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

function setsForCadence(
  cadence: GoalCadence,
  props: PastGoalsArchiveProps,
): { sets: GoalSet[]; hasMore: boolean } {
  if (cadence === "DAILY") {
    return { sets: props.daily, hasMore: props.hasMoreDaily };
  }
  if (cadence === "WEEKLY") {
    return { sets: props.weekly, hasMore: props.hasMoreWeekly };
  }
  return { sets: props.term, hasMore: props.hasMoreTerm };
}

export function PastGoalsArchive(props: PastGoalsArchiveProps) {
  const anySets =
    props.daily.length > 0 || props.weekly.length > 0 || props.term.length > 0;
  const anyMore = props.hasMoreDaily || props.hasMoreWeekly || props.hasMoreTerm;

  if (!anySets) {
    return (
      <p className="text-sm text-text-muted">
        No archived goals yet. Reset a current cadence to move those goals here.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {GOAL_CADENCES.map((cadence) => {
        const { sets } = setsForCadence(cadence, props);
        if (sets.length === 0) {
          return null;
        }

        return (
          <section key={cadence} className="space-y-3">
            <h2 className="text-base font-semibold text-text-main">{GOAL_CADENCE_LABELS[cadence]}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sets.map((set) => (
                <div key={set.id} className="space-y-1">
                  <p className="px-1 text-xs text-text-muted">
                    {set.user.name ?? set.user.email}
                    {set.archivedAt ? ` · archived ${formatShortDate(set.archivedAt)}` : null}
                  </p>
                  <GoalCadenceSection
                    cadence={set.cadence}
                    label={set.label}
                    goals={set.goals}
                    isOwner={false}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {anyMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2 text-sm"
            disabled={props.loadingMore}
            onClick={props.onLoadMore}
          >
            {props.loadingMore ? "Loading…" : "Load more…"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
