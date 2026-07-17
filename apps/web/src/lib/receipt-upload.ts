import { getApiUrl } from "@/lib/auth-token";
import { isDemoRuntimeActive, uploadDemoReceipts } from "@/demo/demo-link";
import { RECEIPT_MAX_BYTE_SIZE } from "@life/shared";

export async function uploadReceiptFiles(files: File[], folderId: string | null) {
  for (const file of files) {
    if (file.size > RECEIPT_MAX_BYTE_SIZE) {
      throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
    }
  }

  if (isDemoRuntimeActive()) {
    return { receipts: uploadDemoReceipts(files, folderId) };
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
  if (isDemoRuntimeActive()) {
    return new Blob([`Demo receipt ${receiptId}\n\nNo real document is stored in demo mode.`], {
      type: "text/plain",
    });
  }

  const response = await fetch(getReceiptFileUrl(receiptId), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not load receipt file.");
  }

  return response.blob();
}
