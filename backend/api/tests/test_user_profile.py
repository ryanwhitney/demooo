import os
import shutil
import tempfile
import re

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from .base import BaseAPITestCase
from api.models import Profile


# Create a temp media root for testing to avoid polluting the real media directory
TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class UserProfileTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        # Make sure test runs with clean temp directory
        if os.path.exists(TEMP_MEDIA_ROOT):
            for item in os.listdir(TEMP_MEDIA_ROOT):
                item_path = os.path.join(TEMP_MEDIA_ROOT, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)

    def tearDown(self):
        # Clean up temp files after each test
        if os.path.exists(TEMP_MEDIA_ROOT):
            for item in os.listdir(TEMP_MEDIA_ROOT):
                item_path = os.path.join(TEMP_MEDIA_ROOT, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
        super().tearDown()

    def test_profile_created_with_user(self):
        """Test that creating a user via GraphQL creates a profile automatically"""
        # Create a user via the GraphQL API
        query = """
        mutation {
            createUser(
                username: "profileuser",
                email: "profile@example.com",
                password: "password123"
            ) {
                user {
                    id
                    username
                    profile {
                        id
                    }
                }
            }
        }
        """
        response = self.execute(query)

        # Verify no errors and profile ID is returned
        self.assertIsNone(response.errors, f"Unexpected errors: {response.errors}")
        self.assertIsNotNone(response.data["createUser"]["user"]["profile"]["id"])

        # Verify we can query the profile
        username = response.data["createUser"]["user"]["username"]
        profile_query = f"""
        query {{
            user(username: "{username}") {{
                profile {{
                    id
                    name
                    bio
                }}
            }}
        }}
        """
        profile_response = self.execute(profile_query)
        self.assertIsNone(profile_response.errors)

    def test_update_profile(self):
        """Test updating a profile via GraphQL"""
        # Create a user and authenticate
        User = get_user_model()
        user = User.objects.create_user(
            username="updateuser", email="update@example.com", password="testpass123"
        )

        # Update the profile without a profile picture
        update_query = """
        mutation {
            updateProfile(
                name: "Updated Name",
                bio: "Updated Bio"
            ) {
                profile {
                    name
                    bio
                }
            }
        }
        """
        update_response = self.execute(update_query, authenticate=True, user=user)
        self.assertIsNone(
            update_response.errors, f"Unexpected errors: {update_response.errors}"
        )

        # Verify the response contains updated data
        profile_data = update_response.data["updateProfile"]["profile"]
        self.assertEqual(profile_data["name"], "Updated Name")
        self.assertEqual(profile_data["bio"], "Updated Bio")

        # Verify we can query the updated profile
        query = """
        query {
            me {
                profile {
                    name
                    bio
                }
            }
        }
        """
        query_response = self.execute(query, authenticate=True, user=user)
        self.assertIsNone(query_response.errors)
        queried_profile = query_response.data["me"]["profile"]
        self.assertEqual(queried_profile["name"], "Updated Name")
        self.assertEqual(queried_profile["bio"], "Updated Bio")

    def test_get_profile_by_username(self):
        """Test querying a user profile by username"""
        # Create a user with profile data
        User = get_user_model()
        user = User.objects.create_user(
            username="queryuser", email="query@example.com", password="testpass123"
        )

        # Update profile data directly (not via GraphQL)
        user.profile.name = "Query User"
        user.profile.bio = "Test bio for query user"
        user.profile.save()

        # Query user by username
        query = """
        query($username: String!) {
            user(username: $username) {
                username
                profile {
                    name
                    bio
                }
            }
        }
        """
        variables = {"username": "queryuser"}
        response = self.execute(query, variables=variables)

        # Verify the response
        self.assertIsNone(response.errors)
        user_data = response.data["user"]
        self.assertEqual(user_data["username"], "queryuser")
        self.assertEqual(user_data["profile"]["name"], "Query User")
        self.assertEqual(user_data["profile"]["bio"], "Test bio for query user")

    def test_profile_in_artist_query(self):
        """Test that artist queries include profile information"""
        # Create a user who will be our "artist"
        User = get_user_model()
        artist = User.objects.create_user(
            username="artistuser", email="artist@example.com", password="testpass123"
        )

        # Set profile data
        artist.profile.name = "Artist Name"
        artist.profile.bio = "Artist bio"
        artist.profile.save()

        # Query the artist using the artist query
        query = """
        query($username: String!) {
            user(username: $username) {
                username
                profile {
                    name
                    bio
                }
                tracks {
                    id
                }
            }
        }
        """
        variables = {"username": "artistuser"}
        response = self.execute(query, variables=variables)

        # Verify the profile data is included
        self.assertIsNone(response.errors)
        artist_data = response.data["user"]
        self.assertEqual(artist_data["username"], "artistuser")
        self.assertEqual(artist_data["profile"]["name"], "Artist Name")
        self.assertEqual(artist_data["profile"]["bio"], "Artist bio")
        self.assertEqual(artist_data["tracks"], [])  # Empty list, not null

    def test_update_profile_with_picture(self):
        """Test updating a profile with a profile picture"""
        # Create a user and authenticate
        User = get_user_model()
        user = User.objects.create_user(
            username="picuser", email="pic@example.com", password="testpass123"
        )

        # Load test profile photo
        test_file_path = os.path.join(
            os.path.dirname(__file__), "fixtures/test_profile_photo.jpeg"
        )
        with open(test_file_path, "rb") as image_file:
            profile_pic = SimpleUploadedFile(
                "test_profile_photo.jpeg", image_file.read(), content_type="image/jpeg"
            )

        # Update profile with picture - don't request profilePictureUrl in tests
        update_query = """
        mutation($file: Upload!) {
            updateProfile(
                name: "Picture User",
                bio: "Has a profile picture",
                profilePicture: $file
            ) {
                profile {
                    name
                    bio
                    profilePicture
                    profilePictureOptimizedUrl
                }
            }
        }
        """

        variables = {"file": profile_pic}
        update_response = self.execute(
            update_query, variables=variables, authenticate=True, user=user
        )
        self.assertIsNone(
            update_response.errors, f"Unexpected errors: {update_response.errors}"
        )

        # Verify the response contains updated data and profile picture path
        profile_data = update_response.data["updateProfile"]["profile"]
        self.assertEqual(profile_data["name"], "Picture User")
        self.assertEqual(profile_data["bio"], "Has a profile picture")
        self.assertIsNotNone(profile_data["profilePicture"])
        self.assertIsNotNone(profile_data["profilePictureOptimizedUrl"])

        # Check that the optimized URL contains the expected path structure
        # Updated to check for the short unique ID pattern
        unique_id_pattern = r"/new/profile_\d+[a-f0-9]+\.jpg"
        self.assertTrue(
            re.search(unique_id_pattern, profile_data["profilePictureOptimizedUrl"]),
            "Optimized URL does not have the expected unique ID filename pattern",
        )

        # Query profile to verify picture data is accessible
        query = """
        query {
            me {
                profile {
                    profilePicture
                    profilePictureOptimizedUrl
                }
            }
        }
        """
        query_response = self.execute(query, authenticate=True, user=user)
        self.assertIsNone(query_response.errors)
        queried_profile = query_response.data["me"]["profile"]
        self.assertIsNotNone(queried_profile["profilePicture"])
        self.assertIsNotNone(queried_profile["profilePictureOptimizedUrl"])

        # Store the first profile path to check for change after update
        first_profile_path = queried_profile["profilePictureOptimizedUrl"]

        # Update again with a new profile picture to test path change
        with open(test_file_path, "rb") as image_file:
            new_profile_pic = SimpleUploadedFile(
                "new_test_photo.jpeg", image_file.read(), content_type="image/jpeg"
            )

        variables = {"file": new_profile_pic}
        second_update_response = self.execute(
            update_query, variables=variables, authenticate=True, user=user
        )
        self.assertIsNone(second_update_response.errors)

        # Query again to verify path changed
        second_query_response = self.execute(query, authenticate=True, user=user)
        second_profile = second_query_response.data["me"]["profile"]
        second_profile_path = second_profile["profilePictureOptimizedUrl"]

        # Verify the path changed (different timestamp)
        self.assertNotEqual(
            first_profile_path,
            second_profile_path,
            "Profile picture path did not change after update (timestamps should differ)",
        )
