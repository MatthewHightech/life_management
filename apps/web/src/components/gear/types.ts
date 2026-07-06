import type { GearLibraryQuery } from "@/graphql";

export type GearFolder = GearLibraryQuery["gearLibrary"]["folders"][number];
export type GearItem = GearLibraryQuery["gearLibrary"]["items"][number];
export type GearItemClass = GearLibraryQuery["gearLibrary"]["classes"][number];
export type GearVariant = GearItemClass["variants"][number];
export type GearCondition = GearItem["condition"];

export type StagedGearEntry =
  | {
      kind: "item";
      id: string;
      name: string;
      hasPhoto: boolean;
      condition: GearCondition;
    }
  | {
      kind: "variant";
      id: string;
      name: string;
      hasPhoto: boolean;
      condition: GearCondition;
      className: string;
    };

export type GearItemFormValues = {
  name: string;
  description: string;
  size: string;
  careInstructions: string;
  condition: GearCondition;
};

export type GearClassFormValues = {
  name: string;
  description: string;
  careInstructions: string;
};

export type GearVariantFormValues = {
  name: string;
  size: string;
  condition: GearCondition;
};
