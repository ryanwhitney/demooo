import os
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from .base import BaseAPITestCase
from api.models import Profile


class UserProfileTests(BaseAPITestCase):
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
        response = self.client.execute(query)

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
        profile_response = self.client.execute(profile_query)
        self.assertIsNone(profile_response.errors)

    def test_update_profile(self):
        """Test updating a profile via GraphQL"""
        # Create a user and authenticate
        User = get_user_model()
        user = User.objects.create_user(
            username="updateuser", email="update@example.com", password="testpass123"
        )
        self.client.authenticate(user)

        # Update the profile - adjust based on your schema
        # Note: If profilePicture is optional in your implementation but required in the schema,
        # we need to pass null or use a test file
        update_query = """
        mutation {
            updateProfile(
                name: "Updated Name",
                bio: "Updated Bio",
                profilePicture: null
            ) {
                profile {
                    name
                    bio
                }
            }
        }
        """
        update_response = self.client.execute(update_query)
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
        query_response = self.client.execute(query)
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
        response = self.client.execute(query, variables)

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
        response = self.client.execute(query, variables)

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
        self.client.authenticate(user)

        # Load test profile photo
        test_file_path = os.path.join(
            os.path.dirname(__file__), "fixtures/test_profile_photo.jpeg"
        )
        with open(test_file_path, "rb") as image_file:
            profile_pic = SimpleUploadedFile(
                "test_profile_photo.jpeg", image_file.read(), content_type="image/jpeg"
            )

        # Update profile with picture
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
        update_response = self.client.execute(update_query, variables)
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
        self.assertTrue(
            profile_data["profilePictureOptimizedUrl"].endswith(
                "/optimized/profile.jpg"
            ),
            "Optimized URL does not have the expected path structure",
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
        query_response = self.client.execute(query)
        self.assertIsNone(query_response.errors)
        queried_profile = query_response.data["me"]["profile"]
        self.assertIsNotNone(queried_profile["profilePicture"])
        self.assertIsNotNone(queried_profile["profilePictureOptimizedUrl"])
