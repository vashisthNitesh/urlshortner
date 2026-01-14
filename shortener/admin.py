import csv
from django.contrib import admin
from django.http import HttpResponse

from .models import (
    ClickEvent,
    CustomDomain,
    Link,
    LinkDestinationChange,
    SubscriptionEvent,
    Tag,
    UserProfile,
    UTMTemplate,
)


def export_links_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = "attachment; filename=links.csv"
    writer = csv.writer(response)
    writer.writerow(["slug", "destination_url", "user", "created_at", "clicks"])
    for link in queryset:
        writer.writerow([link.slug, link.destination_url, link.user, link.created_at, link.clicks.count()])
    return response


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ("slug", "destination_url", "user", "created_at", "is_active")
    list_filter = ("is_active", "created_at")
    search_fields = ("slug", "destination_url", "title", "user__username")
    actions = [export_links_csv]


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ("link", "created_at", "country", "device", "browser")
    list_filter = ("country", "device", "browser")
    search_fields = ("link__slug", "referrer")


admin.site.register(UserProfile)
admin.site.register(CustomDomain)
admin.site.register(Tag)
admin.site.register(UTMTemplate)
admin.site.register(LinkDestinationChange)
admin.site.register(SubscriptionEvent)
