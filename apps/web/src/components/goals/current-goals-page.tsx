"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import type { GoalCadence } from "@life/shared";
import type { ComponentProps } from "react";
import { GoalsPageLayout } from "@/components/goals/goals-page-layout";
import {
  MemberGoalsColumn,
  type MemberCadenceSet,
} from "@/components/goals/member-goals-column";
import {
  CreateGoalDocument,
  CurrentGoalsDocument,
  DeleteGoalDocument,
  ResetGoalsDocument,
  SetGoalCompletedDocument,
  UpdateGoalDocument,
  type CurrentGoalsQuery,
} from "@/graphql";

type OwnerActions = Pick<
  ComponentProps<typeof MemberGoalsColumn>,
  "onAdd" | "onToggleComplete" | "onRename" | "onDelete" | "onReset"
>;

function setsForMember(
  sets: CurrentGoalsQuery["currentGoals"]["sets"],
  memberId: string,
): Partial<Record<GoalCadence, MemberCadenceSet>> {
  const result: Partial<Record<GoalCadence, MemberCadenceSet>> = {};
  for (const set of sets) {
    if (set.user.id !== memberId) {
      continue;
    }
    result[set.cadence] = {
      cadence: set.cadence,
      label: set.label,
      goals: set.goals,
    };
  }
  return result;
}

export function CurrentGoalsPage() {
  const { data, loading, error, refetch } = useQuery(CurrentGoalsDocument);
  const [createGoal] = useMutation(CreateGoalDocument);
  const [updateGoal] = useMutation(UpdateGoalDocument);
  const [setCompleted] = useMutation(SetGoalCompletedDocument);
  const [deleteGoal] = useMutation(DeleteGoalDocument);
  const [resetGoals] = useMutation(ResetGoalsDocument);

  const board = data?.currentGoals;
  const meId = data?.me?.id;

  const ownerActions: OwnerActions = {
    onAdd: async (cadence, title) => {
      await createGoal({ variables: { cadence, title } });
      await refetch();
    },
    onToggleComplete: async (id, completed) => {
      await setCompleted({ variables: { id, completed } });
      await refetch();
    },
    onRename: async (id, title) => {
      await updateGoal({ variables: { id, title } });
      await refetch();
    },
    onDelete: async (id) => {
      await deleteGoal({ variables: { id } });
      await refetch();
    },
    onReset: async (cadence) => {
      await resetGoals({ variables: { cadence } });
      await refetch();
    },
  };

  return (
    <GoalsPageLayout>
      {loading && !board ? <p className="text-sm text-text-muted">Loading goals…</p> : null}
      {error ? <p className="text-sm text-error">Could not load goals.</p> : null}

      {board ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {board.members.map((member) => {
            const isOwner = member.id === meId;
            return (
              <MemberGoalsColumn
                key={member.id}
                member={member}
                isOwner={isOwner}
                setsByCadence={setsForMember(board.sets, member.id)}
                {...(isOwner ? ownerActions : {})}
              />
            );
          })}
        </div>
      ) : null}
    </GoalsPageLayout>
  );
}
