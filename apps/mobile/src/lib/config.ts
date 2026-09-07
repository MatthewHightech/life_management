import Constants from "expo-constants";

export function getApiUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
}

export function getGoogleWebClientId(): string {
  const id = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!id) {
    throw new Error("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is required");
  }
  return id;
}

export function getGoogleIosClientId(): string {
  const id = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  if (!id) {
    throw new Error("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is required for iOS sign-in");
  }
  return id;
}

/** Native redirect scheme registered for the Google iOS OAuth client. */
export function getGoogleIosUrlScheme(): string {
  const clientId = getGoogleIosClientId();
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/i, "");
  return `com.googleusercontent.apps.${prefix}`;
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? "0.1.0";
}
