import { AUTH_COOKIE_NAME } from "@life/shared";

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export function clearLegacyClientAuthCookie() {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

export async function signOut(): Promise<void> {
  clearLegacyClientAuthCookie();
  try {
    await fetch(`${getApiUrl()}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    return;
  }
}
