import os
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from graphql_jwt.testcases import JSONWebTokenTestCase

from .models import Profile, Track

# Create a temp media root for testing
TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class AudioAppTestCase(JSONWebTokenTestCase):
    GRAPHQL_URL = "/graphql"

    def setUp(self):
        super().setUp()
        # Create a test user
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Authenticate the user
        self.client.authenticate(self.user)

        # Load test audio file
        test_dir = os.path.join(os.path.dirname(__file__), "../media/test_files")
        test_file_path = os.path.join(test_dir, "strum.m4a")
        with open(test_file_path, "rb") as audio_file:
            self.audio_file = SimpleUploadedFile(
                "strum.m4a", audio_file.read(), content_type="audio/mpeg"
            )

    def tearDown(self):
        # Clean up temp files
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def test_user_profile_creation(self):
        """Test that a profile is automatically created for new users"""
        self.assertTrue(hasattr(self.user, "profile"))
        self.assertIsInstance(self.user.profile, Profile)

    def test_track_queries(self):
        """Test track query operations"""
        # Create a test track
        track = Track.objects.create(
            artist=self.user,
            title="Test Track",
            title_slug="test-track",
            description="Test Description",
            audio_file=self.audio_file,
        )

        # Test get all tracks query
        query = """
            query {
                tracks {
                    id
                    title
                    titleSlug
                    description
                }
            }
        """
        response = self.client.execute(query)
        self.assertNotIn("errors", response.data)

        # Test get track by ID query
        query = f"""
            query {{
                track(id: "{track.id}") {{
                    id
                    title
                    titleSlug
                }}
            }}
        """
        response = self.client.execute(query)
        self.assertNotIn("errors", response.data)

        # Test get tracks by username
        query = f"""
            query {{
                userTracks(username: "{self.user.username}") {{
                    id
                    title
                }}
            }}
        """
        response = self.client.execute(query)
        self.assertNotIn("errors", response.data)

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
        from .mutations.track_mutations import generate_waveform

        # Use the actual test audio file
        test_dir = os.path.join(os.path.dirname(__file__), "../media/test_files")
        test_file_path = os.path.join(test_dir, "strum.m4a")

        # Test waveform generation with real audio file
        waveform_data = generate_waveform(test_file_path)
        self.assertIsInstance(waveform_data, list)
        self.assertTrue(len(waveform_data) > 0)  # Should have actual data

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


class APITests(JSONWebTokenTestCase):
    def setUp(self):
        self.User = get_user_model()
        super().setUp()

    def test_create_user_mutation(self):
        """Test user creation through GraphQL mutation"""
        query = """
        mutation {
            createUser(
                username: "testuser",
                email: "test@example.com",
                password: "testpass123"
            ) {
                user {
                    id
                    username
                    email
                }
            }
        }
        """
        response = self.client.execute(query)

        self.assertIsNotNone(response.data["createUser"]["user"])
        created_user = response.data["createUser"]["user"]
        self.assertEqual(created_user["username"], "testuser")
        self.assertEqual(created_user["email"], "test@example.com")
        self.assertEqual(self.User.objects.count(), 1)

    def test_graphql_login_mutation(self):
        """Test the login mutation"""
        # Create user
        create_query = """
        mutation {
            createUser(
                username: "testuser",
                email: "test@example.com",
                password: "testpass123"
            ) {
                user {
                    username
                }
            }
        }
        """
        self.client.execute(create_query)

        # Login
        login_query = """
        mutation {
            tokenAuth(username: "testuser", password: "testpass123") {
                token
            }
        }
        """
        response = self.client.execute(login_query)
        self.assertIsNotNone(response.data["tokenAuth"]["token"])

    def test_login_mutation_wrong_password(self):
        """Test login mutation with wrong password"""
        # Create user
        create_query = """
        mutation {
            createUser(
                username: "testuser",
                email: "test@example.com",
                password: "testpass123"
            ) {
                user {
                    username
                }
            }
        }
        """
        self.client.execute(create_query)

        # Login with bad password
        login_query = """
        mutation {
            tokenAuth(username: "testuser", password: "wrongpassword") {
                token
            }
        }
        """
        response = self.client.execute(login_query)
        self.assertIsNotNone(response.errors)
        self.assertIn("Please enter valid credentials", str(response.errors))

    def test_login_mutation_nonexistent_user(self):
        """Test login mutation with nonexistent user"""
        login_query = """
        mutation {
            tokenAuth(username: "nonexistent", password: "testpass123") {
                token
            }
        }
        """
        response = self.client.execute(login_query)
        self.assertIsNotNone(response.errors)
        self.assertIn("Please enter valid credentials", str(response.errors))

    def test_authenticated_query(self):
        """Test that authenticated queries work"""
        # Create user first
        user = self.User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.client.authenticate(user)

        query = """
        query {
            me {
                username
                email
            }
        }
        """
        response = self.client.execute(query)
        self.assertEqual(response.data["me"]["username"], "testuser")
        self.assertEqual(response.data["me"]["email"], "test@example.com")

    def test_authenticated_query_unauthorized(self):
        """Test that unauthenticated queries fail"""
        query = """
        query {
            me {
                username
                email
            }
        }
        """
        response = self.client.execute(query)
        self.assertIsNotNone(response.errors)
        error_msg = "You do not have permission to perform this action"
        self.assertIn(error_msg, str(response.errors))
