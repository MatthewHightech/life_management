export type FolderRecord = {
  id: string;
  parentId?: string | null;
};

export function buildFolderPath<T extends FolderRecord>(folders: T[], folderId: string | null): T[] {
  if (!folderId) {
    return [];
  }

  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const path: T[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder = byId.get(currentId);
    if (!folder) {
      break;
    }

    path.unshift(folder);
    currentId = folder.parentId ?? null;
  }

  return path;
}

export function filterFoldersForParent<T extends FolderRecord>(
  folders: T[],
  parentId: string | null,
): T[] {
  return folders.filter((folder) => (folder.parentId ?? null) === parentId);
}

export function filterItemsForFolder<T extends { folderId?: string | null }>(
  items: T[],
  folderId: string | null,
): T[] {
  return items.filter((item) => (item.folderId ?? null) === folderId);
}

export function folderIdAfterDelete<T extends FolderRecord>(
  folders: T[],
  currentFolderId: string | null,
  deletedFolderId: string,
): string | null {
  if (!currentFolderId) {
    return null;
  }

  const path = buildFolderPath(folders, currentFolderId);
  if (!path.some((folder) => folder.id === deletedFolderId)) {
    return currentFolderId;
  }

  const deletedIndex = path.findIndex((folder) => folder.id === deletedFolderId);
  if (deletedIndex <= 0) {
    return null;
  }

  return path[deletedIndex - 1]?.id ?? null;
}
