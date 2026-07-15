import { getApiUrl } from "@/lib/auth-token";
import { GEAR_PHOTO_MAX_BYTE_SIZE } from "@life/shared";

export function getGearItemPhotoUrl(itemId: string) {
  return `${getApiUrl()}/gear/items/${itemId}/photo`;
}

export function getGearVariantPhotoUrl(variantId: string) {
  return `${getApiUrl()}/gear/variants/${variantId}/photo`;
}

export async function fetchGearItemPhotoBlob(itemId: string) {
  const response = await fetch(getGearItemPhotoUrl(itemId), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not load gear photo.");
  }

  return response.blob();
}

export async function fetchGearVariantPhotoBlob(variantId: string) {
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
