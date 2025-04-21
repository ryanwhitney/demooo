import os
import shutil
import tempfile
from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings, Client
from django.test import TestCase
from graphene.test import Client as GraphQLClient
from api.schema import schema

# Create a temp media root for testing
TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class BaseAudioTestCase(TestCase):
    GRAPHQL_URL = "/graphql"

    def setUp(self):
        super().setUp()
        # Create a test user
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Set up the GraphQL client
        self.client = GraphQLClient(schema)
        self.django_client = Client()

        # Authenticate the user via session
        login_success = self.django_client.login(
            username="testuser", password="testpass123"
        )
        self.assertTrue(login_success, "Failed to log in test user")

        # Load test audio file
        test_file_path = os.path.join(
            os.path.dirname(__file__), "fixtures/test_audio.m4a"
        )
        with open(test_file_path, "rb") as audio_file:
            self.audio_file = SimpleUploadedFile(
                "test_audio.m4a", audio_file.read(), content_type="audio/mpeg"
            )

    def execute(self, query, variables=None, authenticate=True):
        """Execute a GraphQL query with the authenticated session."""
        # Get cookies from the Django client
        cookies = self.django_client.cookies

        # Create a proper request-like context object
        context = SimpleNamespace()
        context.session = self.django_client.session
        # Use the authenticated user only if authenticate=True
        context.user = self.user if authenticate else AnonymousUser()
        context.COOKIES = {key: cookies[key].value for key in cookies}
        context.META = {}
        context.FILES = {}

        # Execute the query
        result = self.client.execute(query, variables=variables, context=context)

        # Convert to a common format that's compatible with JSONWebTokenTestCase
        class ResponseWrapper:
            def __init__(self, result):
                self.data = result.get("data")
                self.errors = result.get("errors")

        return ResponseWrapper(result)

    def tearDown(self):
        # Clean up temp files
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)


class BaseAPITestCase(TestCase):
    def setUp(self):
        super().setUp()
        self.User = get_user_model()

        # Set up the GraphQL client
        self.client = GraphQLClient(schema)
        self.django_client = Client()

    def execute(self, query, variables=None, authenticate=False, user=None):
        """Execute a GraphQL query, optionally with authentication."""
        if authenticate:
            if user is None:
                # Create a default user if needed
                user = self.User.objects.create_user(
                    username="testuser",
                    email="test@example.com",
                    password="testpass123",
                )
            login_success = self.django_client.login(
                username=user.username, password="testpass123"
            )
            self.assertTrue(login_success, "Failed to log in test user")

        # Get cookies from the Django client
        cookies = self.django_client.cookies

        # Create a proper request-like context object
        context = SimpleNamespace()
        context.session = self.django_client.session
        # Use the provided user if authenticated, otherwise use AnonymousUser
        context.user = user if authenticate else AnonymousUser()
        context.COOKIES = {key: cookies[key].value for key in cookies}
        context.META = {}
        context.FILES = {}

        # Execute the query
        result = self.client.execute(query, variables=variables, context=context)

        # Convert to a common format that's compatible with JSONWebTokenTestCase
        class ResponseWrapper:
            def __init__(self, result):
                self.data = result.get("data")
                self.errors = result.get("errors")

        return ResponseWrapper(result)
