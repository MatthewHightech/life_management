import type { CookieOptions, Request, Response } from "express";
import { AUTH_COOKIE_NAME, sessionMaxAgeSeconds } from "@life/shared";

function getWebHostname(): string {
  try {
    return new URL(process.env.WEB_URL ?? "http://localhost:3000").hostname;
  } catch {
    return "localhost";
  }
}

/** Shared parent domain so web + api subdomains both receive the cookie. */
export function getSessionCookieDomain(): string | undefined {
  const host = getWebHostname();
  if (host === "localhost" || host === "127.0.0.1") {
    return undefined;
  }
  return `.${host}`;
}

function isSecureRequest(req: Request): boolean {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return req.secure || req.headers["x-forwarded-proto"] === "https";
}

export function getSessionCookieOptions(req: Request): CookieOptions {
  const domain = getSessionCookieDomain();
  return {
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds * 1000,
    ...(domain ? { domain } : {}),
  };
}

export function setSessionCookie(req: Request, res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, getSessionCookieOptions(req));
}

export function clearSessionCookie(req: Request, res: Response) {
  const domain = getSessionCookieDomain();
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: "lax",
    path: "/",
    ...(domain ? { domain } : {}),
  });
}

export function readSessionCookie(req: Request): string | null {
  const value = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  return value.trim();
}
