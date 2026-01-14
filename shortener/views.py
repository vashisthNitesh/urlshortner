from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .forms import LinkForm
from .models import Link


HIGHLIGHTS = [
    "GDPR-friendly analytics with bot filtering",
    "Premium custom domains with SSL and safety checks",
    "Subscription-ready billing workflows",
    "Security checks and safe-link previews",
]


def home(request: HttpRequest) -> HttpResponse:
    return render(request, "home.html", {"highlights": HIGHLIGHTS})


def pricing(request: HttpRequest) -> HttpResponse:
    tiers = [
        {"name": "Free", "price": "$0", "features": ["Basic redirects", "Ad-supported"], "cta": "Start free"},
        {
            "name": "Growth",
            "price": "$19",
            "features": ["Custom domains", "Password-protected links", "Analytics exports"],
            "cta": "Upgrade",
        },
        {
            "name": "Enterprise",
            "price": "Custom",
            "features": ["Dedicated support", "Audit logs", "Advanced security controls"],
            "cta": "Talk to sales",
        },
    ]
    return render(request, "pricing.html", {"tiers": tiers})


def login_view(request: HttpRequest) -> HttpResponse:
    return render(request, "login.html")


def register(request: HttpRequest) -> HttpResponse:
    return render(request, "register.html")


def dashboard(request: HttpRequest) -> HttpResponse:
    form = LinkForm()
    success_slug = request.GET.get("created")
    if request.method == "POST":
        form = LinkForm(request.POST)
        if form.is_valid():
            link = form.save()
            return redirect(f"{reverse('dashboard')}?created={link.slug}")
    links = Link.objects.order_by("-created_at")
    return render(
        request,
        "dashboard.html",
        {"form": form, "links": links, "success_slug": success_slug},
    )


def redirect_link(_request: HttpRequest, slug: str) -> HttpResponseRedirect:
    link = get_object_or_404(Link, slug=slug)
    return redirect(link.url)


def privacy(request: HttpRequest) -> HttpResponse:
    return render(request, "privacy.html")


def cookies(request: HttpRequest) -> HttpResponse:
    return render(request, "cookies.html")


def terms(request: HttpRequest) -> HttpResponse:
    return render(request, "terms.html")
