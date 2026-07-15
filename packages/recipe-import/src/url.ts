import { RecipeImportError } from "./types";

const PRIVATE_HOST =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)$/i;
const PRIVATE_IPV4 =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

/** Reject non-http(s) and obvious private/local targets (basic SSRF guard). */
export function assertSafeRecipeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new RecipeImportError("Enter a valid http(s) recipe URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RecipeImportError("Only http and https URLs are supported.");
  }

  const host = url.hostname.toLowerCase();
  if (PRIVATE_HOST.test(host) || host.endsWith(".local") || PRIVATE_IPV4.test(host)) {
    throw new RecipeImportError("That URL cannot be imported.");
  }

  return url;
}
