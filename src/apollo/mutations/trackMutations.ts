import { gql } from "@apollo/client";

export const UPLOAD_TRACK = gql`
  mutation UploadTrack($title: String!, $description: String, $file: Upload!) {
    uploadTrack(title: $title, description: $description, file: $file) {
      track {
        id
        title
        description
        audioFile
        audioUrl
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
        audioUrl
      }
      failedUploads
    }
  }
`;
