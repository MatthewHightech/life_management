import { getApiUrl } from "@/lib/auth-token";
import { RECEIPT_MAX_BYTE_SIZE } from "@life/shared";

export async function uploadReceiptFiles(files: File[], folderId: string | null) {
  for (const file of files) {
    if (file.size > RECEIPT_MAX_BYTE_SIZE) {
      throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
    }
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  if (folderId) {
    formData.append("folderId", folderId);
  }

  const response = await fetch(`${getApiUrl()}/receipts/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Upload failed.");
  }

  return response.json() as Promise<{ receipts: unknown[] }>;
}

export function getReceiptFileUrl(receiptId: string) {
  return `${getApiUrl()}/receipts/${receiptId}/file`;
}

export async function fetchReceiptBlob(receiptId: string) {
  const response = await fetch(getReceiptFileUrl(receiptId), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not load receipt file.");
  }

  return response.blob();
}
