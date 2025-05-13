import { gql } from "@apollo/client";

// check if current user is following a user
export const IS_FOLLOWING = gql`
  query IsFollowing($username: String!) {
    isFollowing(username: $username)
  }
`;
