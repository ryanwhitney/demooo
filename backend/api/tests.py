from django.contrib.auth import get_user_model
from graphql_jwt.testcases import JSONWebTokenTestCase

User = get_user_model()


class APITests(JSONWebTokenTestCase):
    def setUp(self):
        super().setUp()

    def test_create_user_mutation(self):
        """Test user creation through GraphQL mutation"""
        query = '''
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
        '''
        response = self.client.execute(query)
        
        self.assertIsNotNone(response.data['createUser']['user'])
        created_user = response.data['createUser']['user']
        self.assertEqual(created_user['username'], 'testuser')
        self.assertEqual(created_user['email'], 'test@example.com')
        self.assertEqual(User.objects.count(), 1)

    def test_graphql_login_mutation(self):
        """Test the login mutation"""
        # Create user
        create_query = '''
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
        '''
        self.client.execute(create_query)

        # Login
        login_query = '''
        mutation {
            tokenAuth(username: "testuser", password: "testpass123") {
                token
            }
        }
        '''
        response = self.client.execute(login_query)
        self.assertIsNotNone(response.data['tokenAuth']['token'])

    def test_login_mutation_wrong_password(self):
        """Test login mutation with wrong password"""
        # Create user
        create_query = '''
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
        '''
        self.client.execute(create_query)

        # Login with bad password
        login_query = '''
        mutation {
            tokenAuth(username: "testuser", password: "wrongpassword") {
                token
            }
        }
        '''
        response = self.client.execute(login_query)
        self.assertIsNotNone(response.errors)
        self.assertIn("Please enter valid credentials", str(response.errors))

    def test_login_mutation_nonexistent_user(self):
        """Test login mutation with nonexistent user"""
        login_query = '''
        mutation {
            tokenAuth(username: "nonexistent", password: "testpass123") {
                token
            }
        }
        '''
        response = self.client.execute(login_query)
        self.assertIsNotNone(response.errors)
        self.assertIn("Please enter valid credentials", str(response.errors))

    def test_authenticated_query(self):
        """Test that authenticated queries work"""
        # Create user
        create_query = '''
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
        '''
        self.client.execute(create_query)

        # Auth and try query
        user = User.objects.get(username='testuser')
        self.client.authenticate(user)

        query = '''
        query {
            me {
                username
                email
            }
        }
        '''
        response = self.client.execute(query)
        self.assertEqual(response.data['me']['username'], 'testuser')
        self.assertEqual(response.data['me']['email'], 'test@example.com')

    def test_authenticated_query_unauthorized(self):
        """Test that unauthenticated queries fail"""
        query = '''
        query {
            me {
                username
                email
            }
        }
        '''
        response = self.client.execute(query)
        self.assertIsNotNone(response.errors)
        self.assertIn("You do not have permission to perform this action", str(response.errors))
