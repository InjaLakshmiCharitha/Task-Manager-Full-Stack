from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class AuthenticationAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="authtest@example.com",
            password="TestPassword123"
        )

    def test_user_can_login_with_email(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "authtest@example.com",
                "password": "TestPassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_fails_with_incorrect_password(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "authtest@example.com",
                "password": "WrongPassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_view_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["email"],
            "authtest@example.com"
        )
        self.assertNotIn("password", response.data)

    def test_unauthenticated_user_cannot_view_profile(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_update_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            "/api/auth/me/",
            {
                "first_name": "Test",
                "last_name": "User"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()

        self.assertEqual(self.user.first_name, "Test")
        self.assertEqual(self.user.last_name, "User")

    def test_user_can_logout(self):
        self.client.force_authenticate(user=self.user)

        refresh_token = str(RefreshToken.for_user(self.user))

        response = self.client.post(
            "/api/auth/logout/",
            {"refresh": refresh_token},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_205_RESET_CONTENT
        )

    def test_logout_requires_refresh_token(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/auth/logout/",
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

