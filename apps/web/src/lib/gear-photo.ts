import { getApiUrl } from "@/lib/auth-token";
import { isDemoRuntimeActive, setDemoGearPhoto } from "@/demo/demo-link";
import { GEAR_PHOTO_MAX_BYTE_SIZE } from "@life/shared";

export function getGearItemPhotoUrl(itemId: string) {
  return `${getApiUrl()}/gear/items/${itemId}/photo`;
}

export function getGearVariantPhotoUrl(variantId: string) {
  return `${getApiUrl()}/gear/variants/${variantId}/photo`;
}

export async function fetchGearItemPhotoBlob(itemId: string) {
  if (isDemoRuntimeActive()) {
    return demoPhotoBlob(itemId);
  }

  const response = await fetch(getGearItemPhotoUrl(itemId), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not load gear photo.");
  }

  return response.blob();
}

export async function fetchGearVariantPhotoBlob(variantId: string) {
  if (isDemoRuntimeActive()) {
    return demoPhotoBlob(variantId);
  }

  const response = await fetch(getGearVariantPhotoUrl(variantId), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not load gear photo.");
  }

  return response.blob();
}

export async function uploadGearItemPhoto(itemId: string, file: File) {
  if (file.size > GEAR_PHOTO_MAX_BYTE_SIZE) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }

  if (isDemoRuntimeActive()) {
    setDemoGearPhoto("item", itemId);
    return;
  }

  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${getApiUrl()}/gear/items/${itemId}/photo`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Upload failed.");
  }
}

export async function uploadGearVariantPhoto(variantId: string, file: File) {
  if (file.size > GEAR_PHOTO_MAX_BYTE_SIZE) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }

  if (isDemoRuntimeActive()) {
    setDemoGearPhoto("variant", variantId);
    return;
  }

  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${getApiUrl()}/gear/variants/${variantId}/photo`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Upload failed.");
  }
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
