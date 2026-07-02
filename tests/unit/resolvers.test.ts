import { describe, expect, it } from "vitest";
import { resolvers } from "@life/graphql/resolvers";
import { mealResolvers } from "../../packages/graphql/src/meals/resolvers";
import { taskResolvers } from "../../packages/graphql/src/tasks/resolvers";

describe("graphql resolvers", () => {
  it("returns health check", () => {
    expect(resolvers.Query.health()).toBe("ok");
  });

  it("returns pong for ping mutation", () => {
    expect(resolvers.Mutation.ping()).toBe("pong");
  });

  it("merges task query resolvers", () => {
    expect(resolvers.Query.tasks).toBe(taskResolvers.Query.tasks);
    expect(resolvers.Query.taskProjects).toBe(taskResolvers.Query.taskProjects);
  });

  it("merges task mutation resolvers", () => {
    expect(resolvers.Mutation.createTask).toBe(taskResolvers.Mutation.createTask);
    expect(resolvers.Mutation.moveTask).toBe(taskResolvers.Mutation.moveTask);
    expect(resolvers.Mutation.completeTask).toBe(taskResolvers.Mutation.completeTask);
  });

  it("merges meal query resolvers", () => {
    expect(resolvers.Query.mealPlan).toBe(mealResolvers.Query.mealPlan);
  });

  it("merges meal mutation resolvers", () => {
    expect(resolvers.Mutation.createRecipe).toBe(mealResolvers.Mutation.createRecipe);
    expect(resolvers.Mutation.assignMealPlanSlot).toBe(mealResolvers.Mutation.assignMealPlanSlot);
  });

  it("computes isBlocked when dependencies are incomplete", () => {
    const isBlocked = taskResolvers.Task.isBlocked as (parent: {
      blockedBy: { dependsOnTask: { status: string } }[];
    }) => boolean;

    expect(
      isBlocked({
        blockedBy: [{ dependsOnTask: { status: "TODO" } }],
      }),
    ).toBe(true);

    expect(
      isBlocked({
        blockedBy: [{ dependsOnTask: { status: "DONE" } }],
      }),
    ).toBe(false);

    expect(isBlocked({ blockedBy: [] })).toBe(false);
  });
});
