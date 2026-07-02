import type { MealRecipeFolder } from "@/components/meals/types";

export function buildRecipeFolderPath(
  folders: MealRecipeFolder[],
  folderId: string | null,
): MealRecipeFolder[] {
  if (!folderId) {
    return [];
  }

  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const path: MealRecipeFolder[] = [];
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

export function filterFoldersForParent(
  folders: MealRecipeFolder[],
  parentId: string | null,
): MealRecipeFolder[] {
  return folders.filter((folder) => (folder.parentId ?? null) === parentId);
}

export function filterRecipesForFolder(recipes: { folderId?: string | null }[], folderId: string | null) {
  return recipes.filter((recipe) => (recipe.folderId ?? null) === folderId);
}
