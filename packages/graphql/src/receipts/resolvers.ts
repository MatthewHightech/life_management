import { FolderNamespace } from "@prisma/client";
import { GraphQLContext } from "../context";
import { found, requireHouseholdUser } from "../auth";
import { optionalText, requireText, timestampFields } from "../fields";
import { assertFolderInHousehold, loadFoldersForNamespace } from "../folders/helpers";

async function findReceipt(context: GraphQLContext, receiptId: string, householdId: string) {
  return found(
    await context.prisma.receipt.findFirst({ where: { id: receiptId, householdId } }),
    "Receipt not found in household",
  );
}

export const receiptResolvers = {
  Query: {
    receiptLibrary: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const [folders, receipts] = await Promise.all([
        loadFoldersForNamespace(context, householdId, FolderNamespace.RECEIPTS),
        context.prisma.receipt.findMany({
          where: { householdId },
          orderBy: [{ fileName: "asc" }],
        }),
      ]);
      return { folders, receipts };
    },
  },

  Mutation: {
    renameReceipt: async (
      _parent: unknown,
      args: { id: string; fileName: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await findReceipt(context, args.id, householdId);

      return context.prisma.receipt.update({
        where: { id: args.id },
        data: { fileName: requireText(args.fileName, "File name is required") },
      });
    },

    updateReceiptNotes: async (
      _parent: unknown,
      args: { id: string; notes?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await findReceipt(context, args.id, householdId);

      return context.prisma.receipt.update({
        where: { id: args.id },
        data: { notes: optionalText(args.notes) },
      });
    },

    deleteReceipt: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const receipt = await findReceipt(context, args.id, householdId);

      await context.prisma.receipt.delete({ where: { id: args.id } });
      await context.deleteStoredFile?.(receipt.storageKey);
      return true;
    },

    moveReceiptToFolder: async (
      _parent: unknown,
      args: { receiptId: string; folderId?: string | null },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await findReceipt(context, args.receiptId, householdId);
      await assertFolderInHousehold(context, args.folderId, householdId, FolderNamespace.RECEIPTS);

      return context.prisma.receipt.update({
        where: { id: args.receiptId },
        data: { folderId: args.folderId ?? null },
      });
    },
  },

  Receipt: timestampFields,
};
