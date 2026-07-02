import type { FolderColor } from "@life/shared";

export type FolderColorOption = {
  value: FolderColor;
  label: string;
  swatch: string;
};

export const FOLDER_COLOR_OPTIONS: FolderColorOption[] = [
  { value: "BLUSH", label: "Blush", swatch: "bg-[#f9d5d3]" },
  { value: "SKY", label: "Sky", swatch: "bg-[#c8e4f5]" },
  { value: "LAVENDER", label: "Lavender", swatch: "bg-[#d8cff5]" },
  { value: "LEMON", label: "Lemon", swatch: "bg-[#f5ecc8]" },
  { value: "PEACH", label: "Peach", swatch: "bg-[#f5dcc8]" },
  { value: "SAGE", label: "Sage", swatch: "bg-[#d5e0d0]" },
];

const colorByValue = new Map(FOLDER_COLOR_OPTIONS.map((option) => [option.value, option]));

export function getFolderColorOption(color: FolderColor): FolderColorOption {
  return colorByValue.get(color) ?? FOLDER_COLOR_OPTIONS[0];
}
