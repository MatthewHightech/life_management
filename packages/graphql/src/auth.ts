import { GraphQLContext } from "./context";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireHouseholdUser(context: GraphQLContext) {
  if (!context.user?.id) {
    throw new AuthError();
  }

  const user = await context.prisma.user.findUnique({
    where: { id: context.user.id },
    select: { id: true, householdId: true, email: true, name: true },
  });

  if (!user?.householdId) {
    throw new ForbiddenError("User is not linked to a household");
  }

  return {
    userId: user.id,
    householdId: user.householdId,
    email: user.email,
    name: user.name,
  };
}

export async function assertTaskInHousehold(
  context: GraphQLContext,
  taskId: string,
  householdId: string,
) {
  const task = await context.prisma.task.findFirst({
    where: { id: taskId, householdId },
    select: { id: true },
  });

  if (!task) {
    throw new ForbiddenError("Task not found in household");
  }
}
