from .base import BaseAudioTestCase
from api.models import Track


class TrackQueryTests(BaseAudioTestCase):
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
