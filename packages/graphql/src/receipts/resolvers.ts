import { FolderNamespace, Prisma } from "@prisma/client";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";
import { assertFolderInHousehold, loadFoldersForNamespace } from "../folders/helpers";

async function assertReceiptInHousehold(context: GraphQLContext, receiptId: string, householdId: string) {
  const receipt = await context.prisma.receipt.findFirst({
    where: { id: receiptId, householdId },
    select: { id: true },
  });

  if (!receipt) {
    throw new ForbiddenError("Receipt not found in household");
  }
}

async function loadReceiptLibrary(context: GraphQLContext, householdId: string) {
  const [folders, receipts] = await Promise.all([
    loadFoldersForNamespace(context, householdId, FolderNamespace.RECEIPTS),
    context.prisma.receipt.findMany({
      where: { householdId },
      orderBy: [{ fileName: "asc" }],
    }),
  ]);

  return { folders, receipts };
}

export const receiptResolvers = {
  Query: {
    receiptLibrary: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      return loadReceiptLibrary(context, householdId);
    },
  },

  Mutation: {
    renameReceipt: async (
      _parent: unknown,
      args: { id: string; fileName: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertReceiptInHousehold(context, args.id, householdId);

      const fileName = args.fileName.trim();
      if (!fileName) {
        throw new ForbiddenError("File name is required");
      }

      return context.prisma.receipt.update({
        where: { id: args.id },
        data: { fileName },
      });
    },

    updateReceiptNotes: async (
      _parent: unknown,
      args: { id: string; notes?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertReceiptInHousehold(context, args.id, householdId);

      const trimmed = args.notes?.trim() ?? "";
      return context.prisma.receipt.update({
        where: { id: args.id },
        data: { notes: trimmed || null },
      });
    },

    deleteReceipt: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const receipt = await context.prisma.receipt.findFirst({
        where: { id: args.id, householdId },
      });

      if (!receipt) {
        throw new ForbiddenError("Receipt not found in household");
      }

      await context.prisma.receipt.delete({ where: { id: args.id } });
      await context.deleteReceiptFile?.(receipt.storageKey);
      return true;
    },

    moveReceiptToFolder: async (
      _parent: unknown,
      args: { receiptId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertReceiptInHousehold(context, args.receiptId, householdId);

      if (args.folderId) {
        await assertFolderInHousehold(
          context,
          args.folderId,
          householdId,
          FolderNamespace.RECEIPTS,
        );
      }

      return context.prisma.receipt.update({
        where: { id: args.receiptId },
        data: { folderId: args.folderId ?? null },
      });
    },
  },

  Receipt: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  },
};
