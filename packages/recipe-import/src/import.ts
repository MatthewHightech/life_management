import { parseRecipeHtml } from "./parse";
import type { ImportedRecipeDraft } from "./types";
import { RecipeImportError } from "./types";
import { assertSafeRecipeUrl } from "./url";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 2_000_000;

async function readHtmlBody(response: Response): Promise<string> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_HTML_BYTES) {
    throw new RecipeImportError("That page is too large to import.");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_HTML_BYTES) {
    throw new RecipeImportError("That page is too large to import.");
  }

  return new TextDecoder("utf-8").decode(buffer);
}

/** Fetch a recipe page and extract a Schema.org Recipe draft. */
export async function importRecipeFromUrl(rawUrl: string): Promise<ImportedRecipeDraft> {
  const url = assertSafeRecipeUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "LifeManagementRecipeImport/1.0 (+https://localhost)",
      },
    });

    if (!response.ok) {
      throw new RecipeImportError(`Could not fetch that page (${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new RecipeImportError("That URL did not return an HTML page.");
    }

    const html = await readHtmlBody(response);
    return parseRecipeHtml(html, url.toString());
  } catch (error) {
    if (error instanceof RecipeImportError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new RecipeImportError("Timed out fetching that recipe page.");
    }
    throw new RecipeImportError("Could not fetch or parse that recipe page.");
  } finally {
    clearTimeout(timer);
  }
}
