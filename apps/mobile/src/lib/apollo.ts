import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { getApiUrl } from "./config";

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<string | null>;

export function createApolloClient(getAccessToken: TokenGetter, refreshAccessToken: RefreshHandler) {
  const httpLink = new HttpLink({
    uri: `${getApiUrl()}/graphql`,
  });

  const authLink = new ApolloLink((operation, forward) => {
    const token = getAccessToken();
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    }));
    return forward(operation);
  });

  const refreshLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let subscription = forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: async (error) => {
          const isUnauthorized =
            error?.networkError &&
            "statusCode" in error.networkError &&
            error.networkError.statusCode === 401;

          if (!isUnauthorized) {
            observer.error(error);
            return;
          }

          const newToken = await refreshAccessToken();
          if (!newToken) {
            observer.error(error);
            return;
          }

          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${newToken}`,
            },
          }));

          subscription = forward(operation).subscribe(observer);
        },
        complete: observer.complete.bind(observer),
      });

      return () => subscription.unsubscribe();
    });
  });

  return new ApolloClient({
    link: ApolloLink.from([refreshLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Replace list results wholesale (create/delete/refetch) instead of
            // Apollo's default merge warning when array length changes.
            tasks: {
              keyArgs: ["filter"],
              merge(_existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        // Show cache immediately, always hit the network in the background.
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-and-network",
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
  });
}
