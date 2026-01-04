from django.contrib import admin

from .models import ClickEvent, Domain, Link


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('hostname', 'verified', 'created_at')
    search_fields = ('hostname',)


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ('slug', 'url', 'domain', 'status', 'created_at')
    search_fields = ('slug', 'url')
    list_filter = ('status', 'domain')


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ('link', 'referrer', 'country', 'occurred_at')
    search_fields = ('link__slug', 'referrer', 'country')
    list_filter = ('country',)
