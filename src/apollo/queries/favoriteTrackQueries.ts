import { gql } from "@apollo/client"

// check if current user has favorited a track
export const IS_TRACK_FAVORITED = gql`
  query IsTrackFavorited($trackId: ID!) {
    isTrackFavorited(trackId: $trackId)
  }
`;