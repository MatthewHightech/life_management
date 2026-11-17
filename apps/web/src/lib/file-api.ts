import { GEAR_PHOTO_MAX_BYTE_SIZE, RECEIPT_MAX_BYTE_SIZE } from "@life/shared";
import { getApiUrl } from "@/lib/auth-token";
import { isDemoRuntimeActive, setDemoGearPhoto, uploadDemoReceipts } from "@/demo/demo-link";

export type GearPhotoKind = "item" | "variant";

function assertFileSize(file: File, maxBytes: number) {
  if (file.size > maxBytes) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }
}

async function fetchBlob(path: string, errorMessage: string) {
  const response = await fetch(`${getApiUrl()}${path}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.blob();
}

async function postFormData(path: string, formData: FormData) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Upload failed.");
  }

  return response;
}

function gearPhotoPath(kind: GearPhotoKind, id: string) {
  return `/gear/${kind === "item" ? "items" : "variants"}/${id}/photo`;
}

export async function fetchGearPhotoBlob(kind: GearPhotoKind, id: string) {
  if (isDemoRuntimeActive()) {
    return demoPhotoBlob(id);
  }
  return fetchBlob(gearPhotoPath(kind, id), "Could not load gear photo.");
}

export async function uploadGearPhoto(kind: GearPhotoKind, id: string, file: File) {
  assertFileSize(file, GEAR_PHOTO_MAX_BYTE_SIZE);

  if (isDemoRuntimeActive()) {
    setDemoGearPhoto(kind, id);
    return;
  }

  const formData = new FormData();
  formData.append("photo", file);
  await postFormData(gearPhotoPath(kind, id), formData);
}

export async function uploadReceiptFiles(files: File[], folderId: string | null) {
  for (const file of files) {
    assertFileSize(file, RECEIPT_MAX_BYTE_SIZE);
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

  const response = await postFormData("/receipts/upload", formData);
  return response.json() as Promise<{ receipts: unknown[] }>;
}

export async function fetchReceiptBlob(receiptId: string) {
  if (isDemoRuntimeActive()) {
    return new Blob([`Demo receipt ${receiptId}\n\nNo real document is stored in demo mode.`], {
      type: "text/plain",
    });
  }
  return fetchBlob(`/receipts/${receiptId}/file`, "Could not load receipt file.");
}

function demoPhotoBlob(label: string) {
  const safeLabel = label.replace(/[<>&"']/g, "");
  return new Blob(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
        <rect width="100%" height="100%" fill="#e8efe5"/>
        <text x="50%" y="48%" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#36543c">Demo gear photo</text>
        <text x="50%" y="57%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#607466">${safeLabel}</text>
      </svg>`,
    ],
    { type: "image/svg+xml" },
  );
}
