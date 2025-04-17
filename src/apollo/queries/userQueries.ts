import { gql } from "@apollo/client";

/**** MUTATIONS ****/

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
  mutation updateProfile($name: String, $bio: String) {
    updateProfile(name: $name, bio: $bio) {
      profile {
        id
        name
        bio
      }
    }
  }
`;

/**** QUERIES ****/

export const GET_ME = gql`
  query Whom {
    me {
      id
      username
      email
      profile {
        id
        name
        bio
      }
    }
  }
`;

export const GET_USERNAME = gql`
  query CheckUsernameAvailability($username: String!) {
    user(username: $username) {
      id
      username
    }
  }
`;

export const GET_ARTIST = gql`
  query GetArtist($username: String!) {
    user(username: $username) {
      id
      username
      profile {
        id
        name
        bio
      }
      tracks {
        id
        title
        titleSlug
        createdAt
        updatedAt
        description
        audioFile
        audioLength
        audioWaveformData
        artist {
          id
          username
        }
      }
    }
  }
`;
