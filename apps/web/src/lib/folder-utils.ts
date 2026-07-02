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
