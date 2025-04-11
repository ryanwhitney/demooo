from django.test import TestCase
from django.contrib.auth import get_user_model
from graphene.test import Client
from .schema import schema

User = get_user_model()

class APITests(TestCase):
    def setUp(self):
        self.client = Client(schema)
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_user_creation(self):
        """Test that a user can be created"""
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')

    def test_login_mutation(self):
        """Test the login mutation"""
        query = '''
        mutation {
            tokenAuth(username: "testuser", password: "testpass123") {
                token
            }
        }
        '''
        result = self.client.execute(query)
        self.assertIsNotNone(result['data']['tokenAuth']['token'])
