import { gql } from "@apollo/client";

/**** MUTATIONS ****/

export const UPLOAD_TRACK = gql`
  mutation UploadTrack($title: String!, $description: String, $file: Upload!) {
    uploadTrack(title: $title, description: $description, file: $file) {
      track {
        id
        title
        description
        audioFile
      }
    }
  }
`;

export const UPLOAD_MULTIPLE_TRACKS = gql`
  mutation UploadMultipleTracks($files: [Upload!]!, $titles: [String!]!, $descriptions: [String!]) {
    uploadMultipleTracks(files: $files, titles: $titles, descriptions: $descriptions) {
      tracks {
        id
        title
        description
        audioFile
      }
      failedUploads
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
      titleSLug
      audioFile
      audioLength
      audioWaveformData
      audioWaveformResolution
      createdAt
      updatedAt
      artist {
        username
        id
      }
    }
  }
`;

export const GET_ALL_TRACKS = gql`
  query GetAllTracks {
    tracks {
      id
      title
      titleSlug
      description
      audioFile
      audioLength
      audioWaveformData
      audioWaveformResolution
      createdAt
      artist {
        username
        id
        profile{
          name
          profilePictureOptimizedUrl
        }
      }
    }
  }
`;

export const GET_USER_TRACKS = gql`
  query GetUserTracks($username: String!) {
    userTracks(username: $username) {
      id
      title
      titleSlug
      artist{
        id
        username
      }
      description
      audioFile
      audioLength
      audioWaveformData
      audioWaveformResolution
      createdAt
      updatedAt
    }
  }
`;

export const GET_TRACK_BY_SLUG = gql`
  query GetTrackBySlug($username: String!, $slug: String!) {
    trackBySlug(username: $username, slug: $slug) {
      id
      title
      titleSlug
      description
      audioFile
      audioLength
      audioWaveformData
      createdAt
      updatedAt
      artist {
        username
        id
      }
    }
  }
`;