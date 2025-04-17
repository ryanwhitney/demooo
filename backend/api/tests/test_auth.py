from .base import BaseTestCase


class AuthTests(BaseTestCase):
    def test_create_user_mutation(self):
        """Test user creation through GraphQL mutation"""
        query = """
        mutation {
            createUser(
                username: "newuser",
                email: "new@example.com",
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
        self.assertEqual(created_user["username"], "newuser")
        self.assertEqual(created_user["email"], "new@example.com")
        self.assertEqual(self.User.objects.count(), 2)  # One from setup + new one

    def test_graphql_login_mutation(self):
        """Test the login mutation"""
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
        self.client.authenticate(self.user)

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
