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

      if (input.parentId) {
        await assertFolderInHousehold(context, input.parentId, householdId, input.namespace);
      }

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
  },

  Folder: {
    itemCount: (parent: {
      namespace: FolderNamespace;
      _count?: { recipes: number; receipts: number };
    }) => {
      if (parent.namespace === FolderNamespace.MEALS) {
        return parent._count?.recipes ?? 0;
      }
      return parent._count?.receipts ?? 0;
    },
    childFolderCount: (parent: { _count?: { children: number } }) => parent._count?.children ?? 0,
  },
};
