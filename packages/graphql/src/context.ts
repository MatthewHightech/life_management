import { AuthUser } from "@life/shared";
import { prisma, PrismaClient } from "@life/db";

export type GraphQLContext = {
  prisma: PrismaClient;
  user: AuthUser | null;
  deleteReceiptFile?: (storageKey: string) => Promise<void>;
  deleteGearPhoto?: (storageKey: string) => Promise<void>;
};

export function createGraphQLContext(
  user: AuthUser | null,
  options?: {
    deleteReceiptFile?: (storageKey: string) => Promise<void>;
    deleteGearPhoto?: (storageKey: string) => Promise<void>;
  },
): GraphQLContext {
  return {
    prisma,
    user,
    deleteReceiptFile: options?.deleteReceiptFile,
    deleteGearPhoto: options?.deleteGearPhoto,
  };
}
