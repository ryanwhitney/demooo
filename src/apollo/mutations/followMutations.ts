import { gql } from "@apollo/client"

export const FOLLOW_USER = gql`
  mutation FollowUser($username: String!) {
    followUser(username: $username) {
      success
      message
      user {
        id
        username
        followersCount
      }
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($username: String!) {
    unfollowUser(username: $username) {
      success
      message
      user {
        id
        username
        followersCount
      }
    }
  }
`;