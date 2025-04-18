import os
from django.core.files.storage import default_storage
from .base import BaseAudioTestCase
from api.models import Track


class AudioProcessingTests(BaseAudioTestCase):
    def test_audio_conversion_and_directory_structure(self):
        """Test that audio conversion works and directory structure is created correctly"""
        # Create a track with an M4A file (should be converted to MP3)
        query = """
            mutation($file: Upload!, $title: String!) {
                uploadTrack(file: $file, title: $title) {
                    track {
                        id
                        audioFile
                        audioWaveformData
                    }
                }
            }
        """

        variables = {"file": self.audio_file, "title": "Audio Conversion Test"}

        # Pass the variables to the execute method
        response = self.client.execute(query, variables)
        self.assertIsNone(response.errors, f"Unexpected errors: {response.errors}")

        track_id = response.data["uploadTrack"]["track"]["id"]
        audio_file_path = response.data["uploadTrack"]["track"]["audioFile"]

        # Check directory structure
        user_id = str(self.user.id)
        expected_base_path = f"{user_id}/audio/{track_id}"
        self.assertEqual(audio_file_path, expected_base_path)

        # Check that both directories exist
        orig_dir = f"{expected_base_path}/orig"
        mp3_dir = f"{expected_base_path}/320"

        self.assertTrue(default_storage.exists(orig_dir))
        self.assertTrue(default_storage.exists(mp3_dir))

        # Check original file exists with correct extension
        original_ext = os.path.splitext(self.audio_file.name)[1]
        orig_file = f"{orig_dir}/{track_id}{original_ext}"
        self.assertTrue(default_storage.exists(orig_file))

        # Check converted MP3 file exists
        mp3_file = f"{mp3_dir}/{track_id}.mp3"
        self.assertTrue(default_storage.exists(mp3_file))

        # Verify waveform data was generated
        self.assertIsNotNone(response.data["uploadTrack"]["track"]["audioWaveformData"])

        # Clean up
        track = Track.objects.get(id=track_id)
        track.delete()

    def test_waveform_generation(self):
        """Test waveform data generation for uploaded tracks with new directory structure"""
        from api.mutations.track_mutations import generate_waveform

        # Use the actual test audio file
        test_file_path = os.path.join(
            os.path.dirname(__file__), "fixtures/test_audio.m4a"
        )

        # Test waveform generation with real audio file
        waveform_data, duration = generate_waveform(test_file_path)
        self.assertIsInstance(waveform_data, list)
        self.assertTrue(len(waveform_data) > 0)  # Should have actual data
        self.assertTrue(duration > 0)

        # Create track via mutation to ensure waveform generation runs
        query = """
            mutation($file: Upload!, $title: String!) {
                uploadTrack(file: $file, title: $title) {
                    track {
                        id
                        audioWaveformData
                        audioFile
                    }
                }
            }
        """

        variables = {"file": self.audio_file, "title": "Waveform Test Via Mutation"}

        # Pass the variables to the execute method
        response = self.client.execute(query, variables)
        self.assertIsNone(response.errors, f"Unexpected errors: {response.errors}")

        track_id = response.data["uploadTrack"]["track"]["id"]
        audio_file_path = response.data["uploadTrack"]["track"]["audioFile"]

        # Ensure waveform data was generated
        self.assertIsNotNone(
            response.data["uploadTrack"]["track"]["audioWaveformData"],
            "Waveform data not generated during track upload",
        )

        # Verify the MP3 path where waveform should be generated from
        user_id = str(self.user.id)
        mp3_path = f"{user_id}/audio/{track_id}/320/{track_id}.mp3"
        self.assertTrue(default_storage.exists(mp3_path))

        # Clean up
        track = Track.objects.get(id=track_id)
        track.delete()
