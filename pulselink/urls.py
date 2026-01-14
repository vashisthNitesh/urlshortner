from django.urls import path
from shortener import views

urlpatterns = [
    path("", views.home, name="home"),
    path("pricing/", views.pricing, name="pricing"),
    path("login/", views.login_view, name="login"),
    path("register/", views.register, name="register"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("privacy/", views.privacy, name="privacy"),
    path("cookies/", views.cookies, name="cookies"),
    path("terms/", views.terms, name="terms"),
    path("r/<slug:slug>/", views.redirect_link, name="redirect"),
]
