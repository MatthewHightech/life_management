export const FOLDER_NAMESPACES = ["MEALS", "RECEIPTS", "GEAR"] as const;

export type FolderNamespace = (typeof FOLDER_NAMESPACES)[number];

export const FOLDER_COLORS = ["BLUSH", "SKY", "LAVENDER", "LEMON", "PEACH", "SAGE"] as const;

export type FolderColor = (typeof FOLDER_COLORS)[number];

export const FOLDER_DROP_PREFIX = "folder:";

export function folderDropId(namespace: FolderNamespace, folderId: string | null): string {
  return `${FOLDER_DROP_PREFIX}${namespace}:${folderId ?? "root"}`;
}

export function parseFolderDropId(
  value: string,
): { namespace: FolderNamespace; folderId: string | null } | undefined {
  if (!value.startsWith(FOLDER_DROP_PREFIX)) {
    return undefined;
  }

  const rest = value.slice(FOLDER_DROP_PREFIX.length);
  const separator = rest.indexOf(":");
  if (separator === -1) {
    return undefined;
  }

  const namespace = rest.slice(0, separator);
  if (!(FOLDER_NAMESPACES as readonly string[]).includes(namespace)) {
    return undefined;
  }

  const folderId = rest.slice(separator + 1);
  return {
    namespace: namespace as FolderNamespace,
    folderId: folderId === "root" ? null : folderId,
  };
}

/** @deprecated Use folderDropId("MEALS", folderId) */
export function recipeFolderDropId(folderId: string | null): string {
  return folderDropId("MEALS", folderId);
}

/** @deprecated Use parseFolderDropId */
export function parseRecipeFolderDropId(value: string): string | null | undefined {
  const parsed = parseFolderDropId(value);
  if (!parsed || parsed.namespace !== "MEALS") {
    return parsed === undefined ? undefined : null;
  }
  return parsed.folderId;
}

export const RECEIPT_MAX_BYTE_SIZE = 10 * 1024 * 1024;

export const RECEIPT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type ReceiptMimeType = (typeof RECEIPT_ALLOWED_MIME_TYPES)[number];

export function isReceiptMimeType(value: string): value is ReceiptMimeType {
  return (RECEIPT_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export function receiptStorageKey(householdId: string, receiptId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${householdId}/${receiptId}/${safeName}`;
}
