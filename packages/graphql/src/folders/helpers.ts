import { FolderNamespace, Prisma } from "@prisma/client";
import { GraphQLContext } from "../context";
import { ForbiddenError } from "../auth";

export const folderInclude = {
  _count: {
    select: { recipes: true, receipts: true, children: true },
  },
} satisfies Prisma.FolderInclude;

export async function assertFolderInHousehold(
  context: GraphQLContext,
  folderId: string,
  householdId: string,
  namespace: FolderNamespace,
) {
  const folder = await context.prisma.folder.findFirst({
    where: { id: folderId, householdId, namespace },
    select: { id: true },
  });

  if (!folder) {
    throw new ForbiddenError("Folder not found in household");
  }
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
