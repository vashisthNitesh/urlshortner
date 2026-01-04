from django.conf import settings
from django.db import models


class Domain(models.Model):
    hostname = models.CharField(max_length=255, unique=True)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.hostname


class Link(models.Model):
    slug = models.SlugField(max_length=64)
    url = models.URLField()
    title = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=32, default='active')
    password = models.CharField(max_length=255, blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    domain = models.ForeignKey(Domain, null=True, blank=True, on_delete=models.SET_NULL, related_name='links')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    preview_safe = models.BooleanField(default=True)

    class Meta:
        unique_together = ('slug', 'domain')

    def __str__(self):
        return f"{self.slug} -> {self.url}"


class ClickEvent(models.Model):
    link = models.ForeignKey(Link, on_delete=models.CASCADE, related_name='click_events')
    referrer = models.CharField(max_length=255, blank=True, null=True)
    device = models.CharField(max_length=255, blank=True, null=True)
    browser = models.CharField(max_length=255, blank=True, null=True)
    os = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    ip_hash = models.CharField(max_length=255, blank=True, null=True)
    occurred_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Click on {self.link.slug} at {self.occurred_at}"
