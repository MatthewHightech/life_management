"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { getApiUrl, getAuthToken } from "@/lib/auth-token";

function makeClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: `${getApiUrl()}/graphql`,
      credentials: "omit",
      fetch: (uri, options) => {
        const token = getAuthToken();

        return fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
        });
      },
    }),
    cache: new InMemoryCache(),
  });
}

const client = makeClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
