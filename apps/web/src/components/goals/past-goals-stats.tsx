"use client";

import { GOAL_CADENCE_LABELS, type GoalCadence } from "@life/shared";
import { Avatar } from "@/components/ui/avatar";
import type { PastGoalsQuery } from "@/graphql";

type PastGoalsStatsProps = {
  stats: PastGoalsQuery["pastGoals"]["stats"];
};

function formatRate(rate: number) {
  return `${Math.round(rate * 100)}%`;
}

function CadenceStat({
  cadence,
  hitRate,
  streak,
}: {
  cadence: GoalCadence;
  hitRate: number;
  streak: number;
}) {
  return (
    <div className="rounded-md bg-background/70 px-2.5 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {GOAL_CADENCE_LABELS[cadence].replace(" Goals", "")}
      </p>
      <p className="mt-1 text-lg font-semibold text-primary">{formatRate(hitRate)}</p>
      <p className="text-xs text-text-muted">
        {streak} streak{streak === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function PastGoalsStats({ stats }: PastGoalsStatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((member) => (
        <article
          key={member.user.id}
          className="rounded-xl border border-border-subtle bg-warm-amber/60 p-4"
        >
          <header className="mb-3 flex items-center gap-2">
            <Avatar
              name={member.user.name}
              email={member.user.email}
              image={member.user.image}
              className="h-8 w-8"
            />
            <h3 className="truncate text-sm font-semibold text-text-main">
              {member.user.name ?? member.user.email}
            </h3>
          </header>
          <div className="grid grid-cols-3 gap-2">
            <CadenceStat cadence="DAILY" hitRate={member.daily.hitRate} streak={member.daily.streak} />
            <CadenceStat
              cadence="WEEKLY"
              hitRate={member.weekly.hitRate}
              streak={member.weekly.streak}
            />
            <CadenceStat cadence="TERM" hitRate={member.term.hitRate} streak={member.term.streak} />
          </div>
        </article>
      ))}
    </div>
  );
}
