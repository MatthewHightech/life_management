import { ApolloServer } from "@apollo/server";
import { GraphQLContext } from "./context";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

export function createApolloServer() {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
  });
}
