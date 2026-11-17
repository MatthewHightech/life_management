import { FolderColor, FolderNamespace } from "@prisma/client";
import { GraphQLContext } from "../context";
import { requireHouseholdUser } from "../auth";
import { assertFolderInHousehold, folderInclude } from "./helpers";

export const folderResolvers = {
  Mutation: {
    createFolder: async (
      _parent: unknown,
      args: {
        input: {
          namespace: FolderNamespace;
          name: string;
          color: FolderColor;
          parentId?: string | null;
        };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const { input } = args;

      await assertFolderInHousehold(context, input.parentId, householdId, input.namespace);

      return context.prisma.folder.create({
        data: {
          householdId,
          namespace: input.namespace,
          parentId: input.parentId ?? null,
          name: input.name.trim(),
          color: input.color,
        },
        include: folderInclude,
      });
    },

    updateFolder: async (
      _parent: unknown,
      args: {
        id: string;
        input: { name?: string | null; color?: FolderColor | null };
      },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertFolderInHousehold(context, args.id, householdId);

      return context.prisma.folder.update({
        where: { id: args.id },
        data: {
          name: args.input.name?.trim() ?? undefined,
          color: args.input.color ?? undefined,
        },
        include: folderInclude,
      });
    },

    deleteFolder: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      await assertFolderInHousehold(context, args.id, householdId);

      await context.prisma.folder.delete({ where: { id: args.id } });
      return true;
    },
  },

  Folder: {
    itemCount: (parent: {
      namespace: FolderNamespace;
      _count?: {
        recipes: number;
        receipts: number;
        gearItems: number;
        gearItemClasses: number;
      };
    }) => {
      if (parent.namespace === FolderNamespace.MEALS) {
        return parent._count?.recipes ?? 0;
      }
      if (parent.namespace === FolderNamespace.GEAR) {
        return (parent._count?.gearItems ?? 0) + (parent._count?.gearItemClasses ?? 0);
      }
      return parent._count?.receipts ?? 0;
    },
    childFolderCount: (parent: { _count?: { children: number } }) => parent._count?.children ?? 0,
  },
};
