import { gql } from "@apollo/client";

export const UPLOAD_TRACK = gql`
  mutation UploadTrack($title: String!, $file: Upload!) {
    uploadTrack(title: $title, file: $file) {
      track {
        id
        title
        audioFile
        audioUrl
        audioWaveformData
        audioLength
      }
    }
  }
`;

export const UPLOAD_MULTIPLE_TRACKS = gql`
  mutation UploadMultipleTracks($files: [Upload!]!, $titles: [String!]!) {
    uploadMultipleTracks(files: $files, titles: $titles) {
      tracks {
        id
        title
        audioFile
        audioUrl
        audioWaveformData
        audioLength
      }
      failedUploads
    }
  }
`;
