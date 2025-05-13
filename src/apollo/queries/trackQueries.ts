import { gql } from "@apollo/client";

export const GET_TRACK = gql`
  query GetTrack($id: ID!) {
    tracks(limit: 12, orderBy: "createdAt_DESC") {
      id
      title
      description
      titleSLug
      audioFile
      audioUrl
      audioLength
      audioWaveformData
      audioWaveformResolution
      createdAt
      updatedAt
      favoritesCount
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
      audioUrl
      audioLength
      audioWaveformData
      createdAt
      favoritesCount
      artist {
        username
        id
        profile{
          id
          name
          profilePictureOptimizedUrl
        }
      }
    }
  }
`;

export const GET_RECENT_TRACKS = gql`
  query GetRecentTracks($limit: Int = 20) {
    tracks(limit: $limit, orderBy: "createdAt_DESC") {
      id
      title
      titleSlug
      audioUrl
      audioLength
      audioWaveformData
      createdAt
      favoritesCount
      artist {
        username
        id
        profile{
          id
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
      audioUrl
      audioLength
      audioWaveformData
      audioWaveformResolution
      createdAt
      updatedAt
      favoritesCount
    }
  }
`;

export const GET_TRACK_TITLES = gql`
  query GetTrackTitles($username: String!) {
    userTracks(username: $username) {
      id
      title
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
      audioUrl
      audioLength
      audioWaveformData
      createdAt
      updatedAt
      favoritesCount
      artist {
        username
        id
      }
    }
  }
`;
