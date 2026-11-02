"use client";

import { GOAL_CADENCES, type GoalCadence } from "@life/shared";
import { GoalCadenceSection } from "@/components/goals/goal-cadence-section";
import type { GoalRowData } from "@/components/goals/goal-row";
import { Avatar } from "@/components/ui/avatar";

export type MemberGoalsColumnMember = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

export type MemberCadenceSet = {
  cadence: GoalCadence;
  label?: string | null;
  goals: GoalRowData[];
};

type MemberGoalsColumnProps = {
  member: MemberGoalsColumnMember;
  isOwner: boolean;
  setsByCadence: Partial<Record<GoalCadence, MemberCadenceSet>>;
  onAdd?: (cadence: GoalCadence, title: string) => Promise<void>;
  onToggleComplete?: (goalId: string, completed: boolean) => Promise<void>;
  onRename?: (goalId: string, title: string) => Promise<void>;
  onDelete?: (goalId: string) => Promise<void>;
  onReset?: (cadence: GoalCadence) => Promise<void>;
};

export function MemberGoalsColumn({
  member,
  isOwner,
  setsByCadence,
  onAdd,
  onToggleComplete,
  onRename,
  onDelete,
  onReset,
}: MemberGoalsColumnProps) {
  return (
    <div className="flex min-w-[240px] flex-1 flex-col gap-4">
      <header className="flex items-center gap-2 px-1">
        <Avatar name={member.name} email={member.email} image={member.image} className="h-8 w-8" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-main">
            {member.name ?? member.email}
            {isOwner ? <span className="ml-1 text-xs font-normal text-text-muted">(you)</span> : null}
          </p>
        </div>
      </header>

      {GOAL_CADENCES.map((cadence) => {
        const set = setsByCadence[cadence];
        return (
          <GoalCadenceSection
            key={cadence}
            cadence={cadence}
            label={set?.label}
            goals={set?.goals ?? []}
            isOwner={isOwner}
            onAdd={onAdd ? (title) => onAdd(cadence, title) : undefined}
            onToggleComplete={onToggleComplete}
            onRename={onRename}
            onDelete={onDelete}
            onReset={onReset ? () => onReset(cadence) : undefined}
          />
        );
      })}
    </div>
  );
}
