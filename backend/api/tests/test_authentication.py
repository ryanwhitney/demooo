from .base import BaseAPITestCase


class AuthenticationTests(BaseAPITestCase):
    def test_create_user_mutation(self):
        """Test user creation through GraphQL mutation"""
        query = """
        mutation {
            createUser(
                username: "testuser123",
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
        response = self.execute(query)

        self.assertIsNotNone(response.data["createUser"]["user"])
        created_user = response.data["createUser"]["user"]
        self.assertEqual(created_user["username"], "testuser123")
        self.assertEqual(created_user["email"], "test@example.com")
        self.assertEqual(self.User.objects.count(), 1)

    def test_create_user_with_invalid_username(self):
        """Test user creation with invalid username characters"""
        query = """
        mutation {
            createUser(
                username: "test_user!",
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
        response = self.execute(query)
        self.assertIsNotNone(response.errors)
        error_msg = "Username must contain only lowercase letters and numbers"
        self.assertIn(error_msg, str(response.errors))

    def test_username_case_insensitivity(self):
        """Test that usernames are case-insensitive"""
        # Create a user with lowercase username
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
        self.execute(create_query)

        # Try to login with uppercase username
        login_query = """
        mutation {
            login(username: "TESTUSER", password: "testpass123") {
                success
                message
                user {
                    username
                }
            }
        }
        """
        response = self.execute(login_query)
        self.assertTrue(response.data["login"]["success"])
        # Verify the returned username is lowercase
        self.assertEqual(response.data["login"]["user"]["username"], "testuser")

    def test_username_normalization(self):
        """Test that usernames are normalized to lowercase when created"""
        query = """
        mutation {
            createUser(
                username: "TestUser123",
                email: "test@example.com",
                password: "testpass123"
            ) {
                user {
                    username
                }
            }
        }
        """
        response = self.execute(query)
        self.assertIsNone(response.errors)
        # Verify the username was normalized to lowercase
        created_username = response.data["createUser"]["user"]["username"]
        self.assertEqual(created_username, "testuser123")

        # Verify in database that username is lowercase
        user = self.User.objects.get(email="test@example.com")
        self.assertEqual(user.username, "testuser123")

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
        self.execute(create_query)

        # Login with the new login mutation
        login_query = """
        mutation {
            login(username: "testuser", password: "testpass123") {
                success
                message
                user {
                    username
                    email
                }
            }
        }
        """
        response = self.execute(login_query)
        self.assertIsNotNone(response.data["login"])
        self.assertTrue(response.data["login"]["success"])
        self.assertEqual(response.data["login"]["user"]["username"], "testuser")

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
        self.execute(create_query)

        # Login with bad password
        login_query = """
        mutation {
            login(username: "testuser", password: "wrongpassword") {
                success
                message
            }
        }
        """
        response = self.execute(login_query)
        self.assertFalse(response.data["login"]["success"])
        self.assertIn(
            "Please enter valid credentials", response.data["login"]["message"]
        )

    def test_login_mutation_nonexistent_user(self):
        """Test login mutation with nonexistent user"""
        login_query = """
        mutation {
            login(username: "nonexistent", password: "testpass123") {
                success
                message
            }
        }
        """
        response = self.execute(login_query)
        self.assertFalse(response.data["login"]["success"])
        self.assertIn(
            "Please enter valid credentials", response.data["login"]["message"]
        )

    def test_authenticated_query(self):
        """Test that authenticated queries work"""
        # Create user first
        user = self.User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        # Use the execute method with authentication
        query = """
        query {
            me {
                username
                email
            }
        }
        """
        response = self.execute(query, authenticate=True, user=user)
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
        # Pass authenticate=False to ensure no authentication
        response = self.execute(query, authenticate=False)
        self.assertIsNotNone(response.errors)
        error_msg = "You do not have permission to perform this action"
        self.assertIn(error_msg, str(response.errors))
