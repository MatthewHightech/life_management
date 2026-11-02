"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import type { GoalCadence } from "@life/shared";
import { GoalsPageLayout } from "@/components/goals/goals-page-layout";
import {
  MemberGoalsColumn,
  type MemberCadenceSet,
} from "@/components/goals/member-goals-column";
import {
  CREATE_GOAL_MUTATION,
  CURRENT_GOALS_QUERY,
  DELETE_GOAL_MUTATION,
  RESET_GOALS_MUTATION,
  SET_GOAL_COMPLETED_MUTATION,
  UPDATE_GOAL_MUTATION,
  type CurrentGoalsQuery,
} from "@/graphql";

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
  const { data, loading, error, refetch } = useQuery(CURRENT_GOALS_QUERY);
  const [createGoal] = useMutation(CREATE_GOAL_MUTATION);
  const [updateGoal] = useMutation(UPDATE_GOAL_MUTATION);
  const [setCompleted] = useMutation(SET_GOAL_COMPLETED_MUTATION);
  const [deleteGoal] = useMutation(DELETE_GOAL_MUTATION);
  const [resetGoals] = useMutation(RESET_GOALS_MUTATION);

  const board = data?.currentGoals;
  const meId = data?.me?.id;

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
                onAdd={
                  isOwner
                    ? async (cadence, title) => {
                        await createGoal({ variables: { cadence, title } });
                        await refetch();
                      }
                    : undefined
                }
                onToggleComplete={
                  isOwner
                    ? async (id, completed) => {
                        await setCompleted({ variables: { id, completed } });
                        await refetch();
                      }
                    : undefined
                }
                onRename={
                  isOwner
                    ? async (id, title) => {
                        await updateGoal({ variables: { id, title } });
                        await refetch();
                      }
                    : undefined
                }
                onDelete={
                  isOwner
                    ? async (id) => {
                        await deleteGoal({ variables: { id } });
                        await refetch();
                      }
                    : undefined
                }
                onReset={
                  isOwner
                    ? async (cadence) => {
                        await resetGoals({ variables: { cadence } });
                        await refetch();
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      ) : null}
    </GoalsPageLayout>
  );
}
