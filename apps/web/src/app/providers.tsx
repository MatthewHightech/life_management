"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { getApiUrl } from "@/lib/auth-token";

function makeClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: `${getApiUrl()}/graphql`,
      credentials: "include",
    }),
    cache: new InMemoryCache({
      typePolicies: {
        // Reports reuse budget section/line IDs across months; do not normalize
        // them by id or a $0 month overwrites another month's cached spend.
        BudgetMonthReport: {
          keyFields: ["year", "month"],
        },
        BudgetReportSection: {
          keyFields: false,
        },
        BudgetReportLineItem: {
          keyFields: false,
        },
        BudgetReportPurchase: {
          keyFields: false,
        },
        BudgetReportComparison: {
          keyFields: false,
        },
      },
    }),
  });
}

const client = makeClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
