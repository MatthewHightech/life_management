import { gql } from "@apollo/client";

export const HOUSEHOLD_SHELL_QUERY = gql`
  query HouseholdShell {
    me {
      id
      name
      email
      image
    }
    household {
      id
      name
      users {
        id
        name
        email
        image
      }
    }
  }
`;
