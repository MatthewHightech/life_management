import * as SecureStore from "expo-secure-store";
import type { MobileAuthUser, MobileTokenPair } from "@life/shared";
import { getApiUrl } from "./config";

const REFRESH_TOKEN_KEY = "life_refresh_token";

export async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function storeRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function clearStoredRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

type MobileGoogleExchangeInput =
  | { idToken: string; deviceId?: string }
  | { code: string; redirectUri: string; deviceId?: string };

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function exchangeGoogleCredentials(
  input: MobileGoogleExchangeInput,
): Promise<MobileTokenPair> {
  return postJson<MobileTokenPair>("/auth/mobile/google", input);
}

export async function refreshMobileSession(refreshToken: string): Promise<MobileTokenPair> {
  return postJson<MobileTokenPair>("/auth/mobile/refresh", { refreshToken });
}

export async function logoutMobileSession(refreshToken: string | null): Promise<void> {
  await postJson<void>("/auth/logout", refreshToken ? { refreshToken } : {});
}

export type SessionState = {
  accessToken: string;
  refreshToken: string;
  user: MobileAuthUser;
};

export function tokenPairToSession(pair: MobileTokenPair): SessionState {
  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    user: pair.user,
  };
}
