import os
from django.core.files.storage import default_storage
from .base import BaseAudioTestCase
from api.models import Track


class TrackMutationTests(BaseAudioTestCase):
    def test_track_mutations(self):
        """Test track mutation operations with new directory structure"""
        # Test upload track mutation
        query = """
            mutation($file: Upload!, $title: String!) {
                uploadTrack(file: $file, title: $title) {
                    track {
                        id
                        title
                        titleSlug
                        audioFile
                    }
                }
            }
        """

        variables = {"file": self.audio_file, "title": "New Test Track"}

        # Pass the variables to the execute method
        response = self.client.execute(query, variables)
        self.assertNotIn("errors", response.data)

        # Get the created track ID and audio file path
        track_id = response.data["uploadTrack"]["track"]["id"]
        audio_file_path = response.data["uploadTrack"]["track"]["audioFile"]

        # Check the directory structure
        user_id = str(self.user.id)
        expected_base_path = f"{user_id}/audio/{track_id}"
        self.assertEqual(
            audio_file_path,
            expected_base_path,
            "Audio file path doesn't match expected directory structure",
        )

        # Verify the MP3 file exists
        mp3_path = f"{expected_base_path}/320/{track_id}.mp3"
        self.assertTrue(
            default_storage.exists(mp3_path), "MP3 file doesn't exist at expected path"
        )

        # Verify the original file exists (might be an M4A in this case)
        original_ext = os.path.splitext(self.audio_file.name)[1]
        orig_path = f"{expected_base_path}/orig/{track_id}{original_ext}"
        self.assertTrue(
            default_storage.exists(orig_path),
            "Original file doesn't exist at expected path",
        )

        # Test update track mutation
        update_query = f"""
            mutation {{
                updateTrack(
                    id: "{track_id}",
                    title: "Updated Track Title",
                    description: "Updated description"
                ) {{
                    track {{
                        id
                        title
                        description
                    }}
                }}
            }}
        """
        response = self.client.execute(update_query)
        self.assertNotIn("errors", response.data)

        # Test delete track mutation
        delete_query = f"""
            mutation {{
                deleteTrack(id: "{track_id}") {{
                    success
                }}
            }}
        """
        response = self.client.execute(delete_query)
        # Check for errors in the response
        self.assertIsNone(response.errors, f"Unexpected errors: {response.errors}")
        # Check that deleteTrack field exists and has success property
        self.assertIn("deleteTrack", response.data, "No deleteTrack field in response")
        self.assertTrue(response.data["deleteTrack"]["success"])

        # Verify the base directory no longer exists after deletion
        self.assertFalse(
            default_storage.exists(expected_base_path),
            "Track directory still exists after deletion",
        )

    def test_authentication_required(self):
        """Test that authentication is required for protected mutations"""
        # Remove authentication
        self.client.logout()

        query = """
            mutation($file: Upload!, $title: String!) {
                uploadTrack(file: $file, title: $title) {
                    track {
                        id
                    }
                }
            }
        """

        variables = {"file": self.audio_file, "title": "Test Track"}

        response = self.client.execute(query, variables)
        self.assertIsNotNone(response.errors, "Expected errors in response")
        error_message = str(response.errors[0])
        self.assertIn("You do not have permission", error_message)

    def test_duplicate_title_prevention(self):
        """Test that users cannot create tracks with duplicate titles"""
        # Create initial track
        Track.objects.create(
            artist=self.user,
            title="Duplicate Test",
            title_slug="duplicate-test",
            audio_file=self.audio_file,
        )

        # Attempt to create another track with the same title
        query = """
            mutation($file: Upload!, $title: String!) {
                uploadTrack(file: $file, title: $title) {
                    track {
                        id
                    }
                }
            }
        """

        variables = {"file": self.audio_file, "title": "Duplicate Test"}

        response = self.client.execute(query, variables)
        self.assertIsNotNone(response.errors, "Expected errors in response")
        error_message = str(response.errors[0])
        self.assertIn("You already have a track with that title", error_message)
