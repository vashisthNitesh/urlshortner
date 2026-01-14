import secrets
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

try:
    import qrcode
except ImportError:  # pragma: no cover - handled in environments without optional dependency
    qrcode = None


User = get_user_model()


class UserProfile(models.Model):
    PLAN_FREE = "free"
    PLAN_PREMIUM = "premium"
    PLAN_CHOICES = [
        (PLAN_FREE, "Free"),
        (PLAN_PREMIUM, "Premium"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default=PLAN_FREE)
    subscription_active = models.BooleanField(default=False)
    subscription_ends_at = models.DateTimeField(null=True, blank=True)
    grace_period_ends_at = models.DateTimeField(null=True, blank=True)
    razorpay_customer_id = models.CharField(max_length=100, blank=True)
    api_key = models.CharField(max_length=64, blank=True, null=True, unique=True)
    api_key_created_at = models.DateTimeField(null=True, blank=True)
    theme_preference = models.CharField(max_length=10, default="light")

    def is_premium(self) -> bool:
        if self.subscription_active:
            return True
        if self.grace_period_ends_at and self.grace_period_ends_at > timezone.now():
            return True
        return self.plan == self.PLAN_PREMIUM

    def ensure_api_key(self) -> str:
        if not self.api_key:
            self.api_key = secrets.token_hex(32)
            self.api_key_created_at = timezone.now()
            self.save(update_fields=["api_key", "api_key_created_at"])
        return self.api_key

    def __str__(self) -> str:
        return f"{self.user.username} profile"


class CustomDomain(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="custom_domains")
    domain = models.CharField(max_length=255, unique=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.domain


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self) -> str:
        return self.name


class UTMTemplate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="utm_templates")
    name = models.CharField(max_length=100)
    source = models.CharField(max_length=100)
    medium = models.CharField(max_length=100)
    campaign = models.CharField(max_length=100)
    term = models.CharField(max_length=100, blank=True)
    content = models.CharField(max_length=100, blank=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.user.username})"


class Link(models.Model):
    REDIRECT_301 = 301
    REDIRECT_302 = 302
    REDIRECT_CHOICES = [
        (REDIRECT_301, "301 Permanent"),
        (REDIRECT_302, "302 Temporary"),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="links")
    guest_email = models.EmailField(blank=True)
    slug = models.SlugField(unique=True, max_length=80)
    destination_url = models.URLField()
    title = models.CharField(max_length=200, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name="links")
    custom_domain = models.ForeignKey(
        CustomDomain, on_delete=models.SET_NULL, null=True, blank=True, related_name="links"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    redirect_type = models.PositiveSmallIntegerField(choices=REDIRECT_CHOICES, default=REDIRECT_301)
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    utm_term = models.CharField(max_length=100, blank=True)
    utm_content = models.CharField(max_length=100, blank=True)
    qr_code_image = models.ImageField(upload_to="qr_codes/", blank=True)
    last_destination_change_at = models.DateTimeField(null=True, blank=True)
    destination_change_count = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.title or self.slug

    def is_available(self) -> bool:
        now = timezone.now()
        if not self.is_active:
            return False
        if self.starts_at and self.starts_at > now:
            return False
        if self.expires_at and self.expires_at <= now:
            return False
        return True

    def short_url(self, request=None) -> str:
        domain = None
        if self.custom_domain and self.custom_domain.is_verified:
            domain = self.custom_domain.domain
        elif request:
            domain = request.get_host()
        if not domain:
            domain = "example.com"
        scheme = "https" if request and request.is_secure() else "http"
        return f"{scheme}://{domain}/r/{self.slug}/"

    def generate_qr_code(self, short_url: str) -> None:
        if not qrcode:
            return
        qr = qrcode.QRCode(box_size=8, border=2)
        qr.add_data(short_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = ContentFile(b"")
        img.save(buffer, format="PNG")
        filename = f"{self.slug}.png"
        self.qr_code_image.save(filename, buffer, save=False)

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = generate_unique_slug()
        if self.starts_at and self.expires_at and self.starts_at >= self.expires_at:
            self.expires_at = self.starts_at + timedelta(days=30)
        super().save(*args, **kwargs)


class LinkDestinationChange(models.Model):
    link = models.ForeignKey(Link, on_delete=models.CASCADE, related_name="destination_changes")
    previous_url = models.URLField()
    new_url = models.URLField()
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)


class ClickEvent(models.Model):
    link = models.ForeignKey(Link, on_delete=models.CASCADE, related_name="clicks")
    created_at = models.DateTimeField(auto_now_add=True)
    referrer = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    device = models.CharField(max_length=100, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    is_qr = models.BooleanField(default=False)


class SubscriptionEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscription_events")
    status = models.CharField(max_length=50)
    plan = models.CharField(max_length=50)
    amount = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=10, default="INR")
    razorpay_event_id = models.CharField(max_length=100, blank=True)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


def generate_unique_slug() -> str:
    while True:
        slug = slugify(secrets.token_urlsafe(5))[:8]
        if not Link.objects.filter(slug=slug).exists():
            return slug
