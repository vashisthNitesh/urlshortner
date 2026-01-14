import json
from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from .models import Link, UserProfile


class LinkFlowTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="testuser", password="pass1234")
        self.profile = self.user.profile
        self.client = Client()

    def test_dashboard_creates_link(self):
        self.client.login(username="testuser", password="pass1234")
        response = self.client.post(
            reverse("dashboard"),
            {"destination_url": "https://example.com", "slug": "example"},
        )
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Link.objects.filter(slug="example", user=self.user).exists())

    def test_api_creates_link(self):
        self.profile.plan = UserProfile.PLAN_PREMIUM
        self.profile.subscription_active = True
        self.profile.save()
        self.profile.ensure_api_key()
        payload = {"destination_url": "https://example.com", "slug": "api-link"}
        response = self.client.post(
            reverse("api_create_link"),
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_API_KEY=self.profile.api_key,
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Link.objects.filter(slug="api-link", user=self.user).exists())

    def test_redirect_counts_click(self):
        link = Link.objects.create(user=self.user, destination_url="https://example.com", slug="redir")
        response = self.client.get(reverse("redirect", kwargs={"slug": "redir"}))
        self.assertEqual(response.status_code, 301)
        self.assertEqual(link.clicks.count(), 1)
