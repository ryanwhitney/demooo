import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      user {
        id
        username
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      message
      user {
        id
        username
        email
        profile {
          id
          name
        }
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation updateProfile($name: String, $bio: String, $location: String, $profilePicture: Upload) {
    updateProfile(name: $name, bio: $bio, location: $location, profilePicture: $profilePicture,) {
      profile {
        id
        name
        bio
        location
        profilePicture
      }
    }
  }
`;
