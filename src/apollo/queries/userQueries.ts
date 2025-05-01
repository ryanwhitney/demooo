import { gql } from '@apollo/client'

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
        location
        profilePicture
        profilePictureOptimizedUrl
      }
    }
  }
`

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
      profile {
        id
        name
        bio
        location
        profilePicture
        profilePictureOptimizedUrl
      }
      tracks {
        id
        title
        titleSlug
        createdAt
        updatedAt
        description
        audioUrl
        audioLength
        audioWaveformData
        artist {
          id
          username
        }
      }
    }
  }
`
