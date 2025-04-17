from .base import AudioTestCase
from ..models import Profile, Track


class TrackModelTests(AudioTestCase):
    def test_user_profile_creation(self):
        """Test that a profile is automatically created for new users"""
        self.assertTrue(hasattr(self.user, "profile"))
        self.assertIsInstance(self.user.profile, Profile)

    def test_track_creation(self):
        """Test basic track model creation"""
        track = Track.objects.create(
            artist=self.user,
            title="Test Track",
            title_slug="test-track",
            description="Test Description",
            audio_file=self.audio_file,
        )

        self.assertEqual(track.title, "Test Track")
        self.assertEqual(track.title_slug, "test-track")
        self.assertEqual(track.artist, self.user)
