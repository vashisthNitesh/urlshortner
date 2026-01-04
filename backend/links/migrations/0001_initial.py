from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Domain',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hostname', models.CharField(max_length=255, unique=True)),
                ('verified', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=64)),
                ('url', models.URLField()),
                ('title', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(default='active', max_length=32)),
                ('password', models.CharField(blank=True, max_length=255, null=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('preview_safe', models.BooleanField(default=True)),
                ('domain', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='links', to='links.domain')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='links', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('slug', 'domain')},
            },
        ),
        migrations.CreateModel(
            name='ClickEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('referrer', models.CharField(blank=True, max_length=255, null=True)),
                ('device', models.CharField(blank=True, max_length=255, null=True)),
                ('browser', models.CharField(blank=True, max_length=255, null=True)),
                ('os', models.CharField(blank=True, max_length=255, null=True)),
                ('country', models.CharField(blank=True, max_length=255, null=True)),
                ('region', models.CharField(blank=True, max_length=255, null=True)),
                ('ip_hash', models.CharField(blank=True, max_length=255, null=True)),
                ('occurred_at', models.DateTimeField(auto_now_add=True)),
                ('link', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='click_events', to='links.link')),
            ],
        ),
    ]
