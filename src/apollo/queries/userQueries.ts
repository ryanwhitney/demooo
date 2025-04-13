import { gql } from "@apollo/client"

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
`
export const AUTH_USER = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      payload
      refreshExpiresIn
    }
  }
`

/**** QUERIES ****/

export const GET_ME = gql`
  query Whom {
    me {
      id
      username
      email
      firstName
      lastName
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
`

export const GET_ARTIST = gql`
  query GetArtist($username: String!) {
    user(username: $username) {
      id
      username
      firstName
      lastName
      profile {
        id
        bio
        website
      }
      tracks {
        id
        title
        description
        audioUrl
      }
    }
  }
`