import { gql } from '@apollo/client';

/**** MUTATIONS ****/

export const UPLOAD_TRACK = gql`
  mutation UploadTrack($title: String!, $description: String, $file: Upload!) {
    uploadTrack(title: $title, description: $description, file: $file) {
      track {
        id
        title
        description
        audioUrl
      }
    }
  }
`;

/**** QUERIES ****/

export const GET_TRACK = gql`
  query GetTrack($id: ID!) {
    track(id: $id) {
      id
      title
      description
      tags
      audioUrl
      createdAt
      updatedAt
      user {
        username
        id
      }
    }
  }
`

export const GET_ALL_TRACKS = gql`
  query GetAllTracks {
    tracks {
      id
      title
      description
      tags
      audioUrl
      createdAt
      user {
        username
        id
      }
    }
  }
`

export const GET_USER_TRACKS = gql`
  query GetUserTracks($username: String!) {
    userTracks(username: $username) {
      id
      title
      description
      tags
      audioUrl
      createdAt
      updatedAt
    }
  }
`