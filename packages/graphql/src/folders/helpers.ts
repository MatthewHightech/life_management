import { FolderNamespace, Prisma } from "@prisma/client";
import { GraphQLContext } from "../context";
import { found } from "../auth";

export const folderInclude = {
  _count: {
    select: {
      recipes: true,
      receipts: true,
      children: true,
      gearItems: true,
      gearItemClasses: true,
    },
  },
} satisfies Prisma.FolderInclude;

export async function assertFolderInHousehold(
  context: GraphQLContext,
  folderId: string | null | undefined,
  householdId: string,
  namespace?: FolderNamespace,
) {
  if (!folderId) {
    return;
  }
  found(
    await context.prisma.folder.findFirst({
      where: { id: folderId, householdId, namespace },
      select: { id: true },
    }),
    "Folder not found in household",
  );
}

export async function loadFoldersForNamespace(
  context: GraphQLContext,
  householdId: string,
  namespace: FolderNamespace,
) {
  return context.prisma.folder.findMany({
    where: { householdId, namespace },
    include: folderInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
