import { AuthUser } from "@life/shared";
import { prisma, PrismaClient } from "@life/db";

export type GraphQLContext = {
  prisma: PrismaClient;
  user: AuthUser | null;
};

export function createGraphQLContext(user: AuthUser | null): GraphQLContext {
  return {
    prisma,
    user,
  };
}
