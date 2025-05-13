import { gql } from "@apollo/client";

export const FAVORITE_TRACK = gql`
  mutation FavoriteTrack($trackId: ID!) {
    favoriteTrack(trackId: $trackId) {
      success
      message
      track {
        id
        favoritesCount
      }
    }
  }
`;

export const UNFAVORITE_TRACK = gql`
  mutation UnfavoriteTrack($trackId: ID!) {
    unfavoriteTrack(trackId: $trackId) {
      success
      message
      track {
        id
        favoritesCount
      }
    }
  }
`;
