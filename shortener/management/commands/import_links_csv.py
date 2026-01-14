import csv
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from shortener.models import Link


class Command(BaseCommand):
    help = "Import links from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str)
        parser.add_argument("--username", type=str, help="Assign links to a specific user.")

    def handle(self, *args, **options):
        csv_path = options["csv_path"]
        username = options.get("username")
        user = None
        if username:
            user = get_user_model().objects.filter(username=username).first()
            if not user:
                raise CommandError("User not found.")
        created = 0
        with open(csv_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                link = Link(
                    user=user,
                    destination_url=row.get("destination_url") or row.get("url") or "",
                    slug=row.get("slug") or "",
                    title=row.get("title", ""),
                )
                link.save()
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Imported {created} links."))
