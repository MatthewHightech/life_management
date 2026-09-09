import { describe, expect, it } from "vitest";
import { formatPlaidErrorMessage, getPlaidErrorDetails } from "../../packages/plaid/src/errors";

describe("plaid error formatting", () => {
  it("extracts Plaid fields from an Axios-style response", () => {
    const error = {
      message: "Request failed with status code 400",
      response: {
        status: 400,
        data: {
          error_type: "ITEM_ERROR",
          error_code: "ITEM_LOGIN_REQUIRED",
          error_message: "the login details of this item have changed",
          display_message: null,
          request_id: "abc123",
        },
      },
    };

    expect(getPlaidErrorDetails(error)).toEqual({
      errorType: "ITEM_ERROR",
      errorCode: "ITEM_LOGIN_REQUIRED",
      errorMessage: "the login details of this item have changed",
      displayMessage: null,
      requestId: "abc123",
      status: 400,
    });

    expect(formatPlaidErrorMessage(error)).toBe(
      "ITEM_LOGIN_REQUIRED: the login details of this item have changed (request abc123)",
    );
  });

  it("prefers display_message when present", () => {
    const error = {
      message: "Request failed with status code 400",
      response: {
        status: 400,
        data: {
          error_code: "INVALID_CREDENTIALS",
          error_message: "the provided credentials were not correct",
          display_message: "The username or password was incorrect.",
        },
      },
    };

    expect(formatPlaidErrorMessage(error)).toBe(
      "INVALID_CREDENTIALS: The username or password was incorrect.",
    );
  });

  it("falls back to Error.message when no Plaid body is present", () => {
    expect(formatPlaidErrorMessage(new Error("network down"))).toBe("network down");
    expect(formatPlaidErrorMessage("weird")).toBe("Bank sync failed");
  });
});
