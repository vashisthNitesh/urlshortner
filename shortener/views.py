from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .forms import LinkForm
from .models import Link


HIGHLIGHTS = [
    "GDPR-friendly analytics with bot filtering",
    "Premium custom domains with SSL and safety checks",
    "Razorpay-backed upgrades for premium access",
    "AdSense-ready placements for free plans",
    "Security checks and safe-link previews",
]


def home(request: HttpRequest) -> HttpResponse:
    return render(request, "home.html", {"highlights": HIGHLIGHTS})


def pricing(request: HttpRequest) -> HttpResponse:
    tiers = [
        {
            "name": "Normal",
            "price": "$0",
            "features": [
                "Basic redirects and branded short links",
                "Ad-supported experience with Google AdSense slots",
                "Standard analytics and link history",
            ],
            "cta": "Create a free account",
        },
        {
            "name": "Premium",
            "price": "$19",
            "features": [
                "No ads for you or your visitors",
                "Custom domains, password-protected links, and QR codes",
                "Advanced analytics exports and priority support",
                "Upgrade via Razorpay checkout",
            ],
            "cta": "Upgrade with Razorpay",
        },
    ]
    return render(request, "pricing.html", {"tiers": tiers})


def login_view(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        return redirect("dashboard")
    return render(request, "login.html")


def register(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        return redirect("dashboard")
    return render(request, "register.html")


def dashboard(request: HttpRequest) -> HttpResponse:
    form = LinkForm()
    success_slug = request.GET.get("created")
    plan = (request.GET.get("plan") or request.POST.get("plan") or "normal").lower()
    is_premium = plan == "premium"
    if request.method == "POST":
        form = LinkForm(request.POST)
        if form.is_valid():
            link = form.save()
            return redirect(f"{reverse('dashboard')}?created={link.slug}&plan={plan}")
    links = Link.objects.order_by("-created_at")
    return render(
        request,
        "dashboard.html",
        {
            "form": form,
            "links": links,
            "success_slug": success_slug,
            "plan": "Premium" if is_premium else "Normal",
            "is_premium": is_premium,
        },
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
