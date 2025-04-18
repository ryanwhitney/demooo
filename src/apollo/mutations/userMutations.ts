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
export const AUTH_USER = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      payload
      refreshExpiresIn
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
