from django.core.management.base import BaseCommand
from django.utils import timezone

from shortener.models import Link


class Command(BaseCommand):
    help = "Deactivate expired links."

    def handle(self, *args, **options):
        now = timezone.now()
        expired_links = Link.objects.filter(is_active=True, expires_at__isnull=False, expires_at__lte=now)
        count = expired_links.update(is_active=False)
        self.stdout.write(self.style.SUCCESS(f"Deactivated {count} expired links."))
