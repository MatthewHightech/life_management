export type ImportedRecipeIngredient = {
  name: string;
  quantity: string | null;
  unit: string | null;
};

export type ImportedRecipeDraft = {
  name: string;
  instructions: string | null;
  servings: number | null;
  ingredients: ImportedRecipeIngredient[];
  sourceUrl: string;
};

export class RecipeImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecipeImportError";
  }
}
