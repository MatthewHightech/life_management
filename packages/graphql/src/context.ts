import { AuthUser } from "@life/shared";
import { prisma, PrismaClient } from "@life/db";

type DeleteStoredFile = (storageKey: string) => Promise<void>;

export type GraphQLContext = {
  prisma: PrismaClient;
  user: AuthUser | null;
  deleteStoredFile?: DeleteStoredFile;
};

export function createGraphQLContext(
  user: AuthUser | null,
  deleteStoredFile?: DeleteStoredFile,
): GraphQLContext {
  return { prisma, user, deleteStoredFile };
}
