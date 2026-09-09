export type PlaidErrorDetails = {
  errorType: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  displayMessage: string | null;
  requestId: string | null;
  status: number | null;
};

type AxiosLikeError = {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Pull Plaid's structured error body out of an Axios/Plaid SDK failure. */
export function getPlaidErrorDetails(error: unknown): PlaidErrorDetails | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const axiosError = error as AxiosLikeError;
  const data = asRecord(axiosError.response?.data);
  if (!data) {
    return null;
  }

  const errorType = readString(data, "error_type");
  const errorCode = readString(data, "error_code");
  const errorMessage = readString(data, "error_message");
  const displayMessage = readString(data, "display_message");
  const requestId = readString(data, "request_id");
  const status = typeof axiosError.response?.status === "number" ? axiosError.response.status : null;

  if (!errorType && !errorCode && !errorMessage && !displayMessage) {
    return null;
  }

  return { errorType, errorCode, errorMessage, displayMessage, requestId, status };
}

/**
 * Human-readable Plaid failure for UI / lastError.
 * Prefer Plaid's fields over Axios's generic "Request failed with status code NNN".
 */
export function formatPlaidErrorMessage(error: unknown): string {
  const details = getPlaidErrorDetails(error);
  if (details) {
    const code = details.errorCode ?? details.errorType ?? "PLAID_ERROR";
    const message =
      details.displayMessage ?? details.errorMessage ?? "Plaid request failed";
    const request = details.requestId ? ` (request ${details.requestId})` : "";
    return `${code}: ${message}${request}`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Bank sync failed";
}
