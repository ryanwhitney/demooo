import { gql } from '@apollo/client';

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