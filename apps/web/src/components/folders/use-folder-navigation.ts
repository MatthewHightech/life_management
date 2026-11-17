import { useCallback, useMemo, useState } from "react";
import {
  buildFolderPath,
  filterFoldersForParent,
  folderIdAfterDelete,
  type FolderRecord,
} from "@/lib/folder-utils";

const NO_FOLDERS: never[] = [];

export function useFolderNavigation<T extends FolderRecord>(folders: T[] = NO_FOLDERS) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const breadcrumbPath = useMemo(() => buildFolderPath(folders, currentFolderId), [folders, currentFolderId]);
  const visibleFolders = useMemo(
    () => filterFoldersForParent(folders, currentFolderId),
    [folders, currentFolderId],
  );

  const handleFolderDeleted = useCallback(
    (deletedFolderId: string) =>
      setCurrentFolderId((currentId) => folderIdAfterDelete(folders, currentId, deletedFolderId)),
    [folders],
  );

  return { currentFolderId, setCurrentFolderId, breadcrumbPath, visibleFolders, handleFolderDeleted };
}
