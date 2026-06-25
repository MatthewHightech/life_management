const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

export function parseAllowedEmails(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowlisted(email: string | undefined, allowedEmails: string[]): boolean {
  if (!email) {
    return false;
  }

  return allowedEmails.includes(email.trim().toLowerCase());
}

export const sessionMaxAgeSeconds = NINETY_DAYS_SECONDS;

export const AUTH_COOKIE_NAME = "auth_token";
