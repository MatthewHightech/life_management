import { toIsoString } from "@life/shared";

export function requireText(value: string, message: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(message);
  }
  return trimmed;
}

export function optionalText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

export function requiredTextUpdate(value: string | null | undefined, message: string) {
  return value == null ? undefined : requireText(value, message);
}

export function optionalTextUpdate(value: string | null | undefined) {
  return value === undefined ? undefined : optionalText(value);
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const timestampFields = {
  createdAt: (parent: { createdAt: Date }) => toIsoString(parent.createdAt),
  updatedAt: (parent: { updatedAt: Date }) => toIsoString(parent.updatedAt),
};
