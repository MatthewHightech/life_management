import { AUTH_COOKIE_NAME, sessionMaxAgeSeconds } from "@life/shared";

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export function getAuthCookieOptions() {
  const isSecure =
    typeof window !== "undefined" ? window.location.protocol === "https:" : process.env.NODE_ENV === "production";

  const secureFlag = isSecure ? "; Secure" : "";
  return `path=/; max-age=${sessionMaxAgeSeconds}; SameSite=Lax${secureFlag}`;
}

export function setAuthToken(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${getAuthCookieOptions()}`;
}

export function clearAuthToken() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${AUTH_COOKIE_NAME}=`;
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(prefix.length));
}

export { AUTH_COOKIE_NAME };
