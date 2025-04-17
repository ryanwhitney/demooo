import os
import shutil
import tempfile
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from graphql_jwt.testcases import JSONWebTokenTestCase

# Create a temp media root for testing
TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class BaseTestCase(JSONWebTokenTestCase):
    GRAPHQL_URL = "/graphql"

    def setUp(self):
        super().setUp()
        # Create a test user
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def tearDown(self):
        # Clean up temp files
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class AudioTestCase(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Authenticate the user
        self.client.authenticate(self.user)

        # Load test audio file
        test_dir = os.path.join(os.path.dirname(__file__), "../../media/test_files")
        test_file_path = os.path.join(test_dir, "strum.m4a")
        with open(test_file_path, "rb") as audio_file:
            self.audio_file = SimpleUploadedFile(
                "strum.m4a", audio_file.read(), content_type="audio/mpeg"
            )
