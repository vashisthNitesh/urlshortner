from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from shortener import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("pricing/", views.pricing, name="pricing"),
    path("login/", views.login_view, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout_view, name="logout"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("dashboard/link/<slug:slug>/", views.link_detail, name="link_detail"),
    path("dashboard/link/<slug:slug>/edit/", views.link_edit, name="link_edit"),
    path("dashboard/link/<slug:slug>/delete/", views.link_delete, name="link_delete"),
    path("dashboard/api-keys/", views.api_keys, name="api_keys"),
    path("dashboard/domains/", views.custom_domains, name="custom_domains"),
    path("dashboard/billing/", views.billing, name="billing"),
    path("billing/checkout/", views.start_checkout, name="start_checkout"),
    path("api/v1/links/", views.api_create_link, name="api_create_link"),
    path("api/v1/links/<slug:slug>/", views.api_link_detail, name="api_link_detail"),
    path("webhooks/razorpay/", views.razorpay_webhook, name="razorpay_webhook"),
    path("privacy/", views.privacy, name="privacy"),
    path("cookies/", views.cookies, name="cookies"),
    path("terms/", views.terms, name="terms"),
    path("r/<slug:slug>/", views.redirect_link, name="redirect"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
