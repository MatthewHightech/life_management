/** Prefer GraphQL error messages from Apollo failures. */
export function apolloErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const graphQLErrors = (error as { graphQLErrors?: Array<{ message?: string }> }).graphQLErrors;
    const fromGraphql = graphQLErrors?.find((entry) => typeof entry.message === "string")?.message;
    if (fromGraphql) {
      return fromGraphql;
    }
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message.replace(/^GraphQL error:\s*/i, "");
    }
  }
  return fallback;
}
