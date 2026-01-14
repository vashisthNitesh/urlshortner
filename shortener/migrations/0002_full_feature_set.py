from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("shortener", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("plan", models.CharField(choices=[("free", "Free"), ("premium", "Premium")], default="free", max_length=20)),
                ("subscription_active", models.BooleanField(default=False)),
                ("subscription_ends_at", models.DateTimeField(blank=True, null=True)),
                ("grace_period_ends_at", models.DateTimeField(blank=True, null=True)),
                ("razorpay_customer_id", models.CharField(blank=True, max_length=100)),
                ("api_key", models.CharField(blank=True, max_length=64, null=True, unique=True)),
                ("api_key_created_at", models.DateTimeField(blank=True, null=True)),
                ("theme_preference", models.CharField(default="light", max_length=10)),
                (
                    "user",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="profile", to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="CustomDomain",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("domain", models.CharField(max_length=255, unique=True)),
                ("is_verified", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="custom_domains", to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Tag",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="UTMTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("source", models.CharField(max_length=100)),
                ("medium", models.CharField(max_length=100)),
                ("campaign", models.CharField(max_length=100)),
                ("term", models.CharField(blank=True, max_length=100)),
                ("content", models.CharField(blank=True, max_length=100)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="utm_templates", to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="SubscriptionEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(max_length=50)),
                ("plan", models.CharField(max_length=50)),
                ("amount", models.PositiveIntegerField(default=0)),
                ("currency", models.CharField(default="INR", max_length=10)),
                ("razorpay_event_id", models.CharField(blank=True, max_length=100)),
                ("payload", models.JSONField(default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="subscription_events", to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name="ClickEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("referrer", models.CharField(blank=True, max_length=255)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=255)),
                ("device", models.CharField(blank=True, max_length=100)),
                ("browser", models.CharField(blank=True, max_length=100)),
                ("country", models.CharField(blank=True, max_length=100)),
                ("is_qr", models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name="LinkDestinationChange",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("previous_url", models.URLField()),
                ("new_url", models.URLField()),
                ("changed_at", models.DateTimeField(auto_now_add=True)),
                (
                    "changed_by",
                    models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.RenameField(model_name="link", old_name="url", new_name="destination_url"),
        migrations.AddField(
            model_name="link",
            name="guest_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name="link",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="link",
            name="starts_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="link",
            name="expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="link",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="link",
            name="redirect_type",
            field=models.PositiveSmallIntegerField(
                choices=[(301, "301 Permanent"), (302, "302 Temporary")], default=301
            ),
        ),
        migrations.AddField(
            model_name="link",
            name="utm_source",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="link",
            name="utm_medium",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="link",
            name="utm_campaign",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="link",
            name="utm_term",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="link",
            name="utm_content",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="link",
            name="qr_code_image",
            field=models.ImageField(blank=True, upload_to="qr_codes/"),
        ),
        migrations.AddField(
            model_name="link",
            name="last_destination_change_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="link",
            name="destination_change_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="link",
            name="custom_domain",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="links", to="shortener.customdomain"
            ),
        ),
        migrations.AddField(
            model_name="link",
            name="tags",
            field=models.ManyToManyField(blank=True, related_name="links", to="shortener.tag"),
        ),
        migrations.AddField(
            model_name="link",
            name="user",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="links", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="clickevent",
            name="link",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="clicks", to="shortener.link"),
        ),
        migrations.AddField(
            model_name="linkdestinationchange",
            name="link",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="destination_changes", to="shortener.link"),
        ),
    ]
