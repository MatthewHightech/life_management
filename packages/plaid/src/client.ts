import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from "plaid";

export type PlaidEnvName = "sandbox" | "development" | "production";

export function getPlaidEnv(): PlaidEnvName {
  const value = (process.env.PLAID_ENV ?? "sandbox").toLowerCase();
  if (value === "sandbox" || value === "development" || value === "production") {
    return value;
  }
  throw new Error(`Invalid PLAID_ENV: ${value}`);
}

export function createPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[getPlaidEnv()],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });

  return new PlaidApi(configuration);
}

export const PLAID_PRODUCTS = [Products.Transactions] as const;
export const PLAID_COUNTRY_CODES = [CountryCode.Ca] as const;
