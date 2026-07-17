"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { useState } from "react";
import { DemoModeProvider } from "@/demo/demo-context";
import { createDemoLink } from "@/demo/demo-link";
import { getApiUrl } from "@/lib/auth-token";

function makeClient(demoMode: boolean) {
  return new ApolloClient({
    link: demoMode
      ? createDemoLink()
      : new HttpLink({
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

export function Providers({
  children,
  demoMode,
}: {
  children: React.ReactNode;
  demoMode: boolean;
}) {
  const [client] = useState(() => makeClient(demoMode));

  return (
    <DemoModeProvider enabled={demoMode}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </DemoModeProvider>
  );
}
