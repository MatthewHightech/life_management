export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String
    image: String
    household: Household
  }

  type Household {
    id: ID!
    name: String!
    users: [User!]!
  }

  type Query {
    health: String!
    me: User
    household: Household
  }

  type Mutation {
    ping: String!
  }
`;
