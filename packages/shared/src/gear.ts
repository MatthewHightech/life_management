export const GEAR_CONDITIONS = ["LIKE_NEW", "GOOD", "FAIR", "RETIRED"] as const;

export type GearCondition = (typeof GEAR_CONDITIONS)[number];

export const GEAR_PHOTO_MAX_BYTE_SIZE = 10 * 1024 * 1024;

export const GEAR_PHOTO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type GearPhotoMimeType = (typeof GEAR_PHOTO_ALLOWED_MIME_TYPES)[number];

export function isGearPhotoMimeType(value: string): value is GearPhotoMimeType {
  return (GEAR_PHOTO_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export function gearPhotoStorageKey(
  householdId: string,
  kind: "items" | "variants",
  entityId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${householdId}/gear/${kind}/${entityId}/${safeName}`;
}

export const GEAR_LEND_ZONE = "gear-lend";

export const GEAR_ITEM_DRAG_PREFIX = "gear-item:";
export const GEAR_VARIANT_DRAG_PREFIX = "gear-variant:";
export const GEAR_CLASS_DRAG_PREFIX = "gear-class:";

export function gearItemDragId(id: string): string {
  return `${GEAR_ITEM_DRAG_PREFIX}${id}`;
}

export function gearVariantDragId(id: string): string {
  return `${GEAR_VARIANT_DRAG_PREFIX}${id}`;
}

export function gearClassDragId(id: string): string {
  return `${GEAR_CLASS_DRAG_PREFIX}${id}`;
}

export type GearDragTarget =
  | { kind: "item"; id: string }
  | { kind: "variant"; id: string }
  | { kind: "class"; id: string };

export function parseGearDragId(value: string): GearDragTarget | undefined {
  if (value.startsWith(GEAR_ITEM_DRAG_PREFIX)) {
    return { kind: "item", id: value.slice(GEAR_ITEM_DRAG_PREFIX.length) };
  }
  if (value.startsWith(GEAR_VARIANT_DRAG_PREFIX)) {
    return { kind: "variant", id: value.slice(GEAR_VARIANT_DRAG_PREFIX.length) };
  }
  if (value.startsWith(GEAR_CLASS_DRAG_PREFIX)) {
    return { kind: "class", id: value.slice(GEAR_CLASS_DRAG_PREFIX.length) };
  }
  return undefined;
}

export function canLendGearCondition(condition: GearCondition): boolean {
  return condition !== "RETIRED";
}

export function validateBorrowerEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("Borrower email is required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Borrower email is invalid");
  }
  return trimmed;
}

export function validateLoanDates(lentAt: Date, returnBy: Date): void {
  const lent = Date.UTC(lentAt.getUTCFullYear(), lentAt.getUTCMonth(), lentAt.getUTCDate());
  const due = Date.UTC(returnBy.getUTCFullYear(), returnBy.getUTCMonth(), returnBy.getUTCDate());
  if (due <= lent) {
    throw new Error("Return-by date must be after lent date");
  }
}
