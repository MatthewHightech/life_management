const NOTES_PREVIEW_LENGTH = 30;

export function formatReceiptRowSubtitle(createdAt: string, notes?: string | null): string {
  const date = new Date(createdAt).toLocaleDateString();
  const trimmed = notes?.trim();

  if (!trimmed) {
    return date;
  }

  const preview =
    trimmed.length <= NOTES_PREVIEW_LENGTH
      ? trimmed
      : `${trimmed.slice(0, NOTES_PREVIEW_LENGTH).trimEnd()}…`;

  return `${date} · ${preview}`;
}

export function formatReceiptAddedDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
