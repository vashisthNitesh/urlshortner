import hmac
import json
import os
from collections import Counter
from datetime import timedelta
from hashlib import sha256

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.core.paginator import Paginator
from django.db import models
from django.db.models import Q
from django.db.models import Count
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils.http import url_has_allowed_host_and_scheme
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .forms import GuestLinkForm, LinkForm, LoginForm, RegisterForm
from .models import (
    ClickEvent,
    CustomDomain,
    Link,
    LinkDestinationChange,
    SubscriptionEvent,
    UserProfile,
    generate_unique_slug,
)



HIGHLIGHTS = [
    "GDPR-friendly analytics with bot filtering",
    "Premium custom domains with SSL and safety checks",
    "Razorpay-backed upgrades for premium access",
    "AdSense-ready placements for free plans",
    "Security checks and safe-link previews",
]


def home(request: HttpRequest) -> HttpResponse:
    form = GuestLinkForm()
    created_link = None
    created_short_url = None
    if request.method == "POST":
        ip = get_client_ip(request) or "anonymous"
        if not rate_limit(f"guest:{ip}", limit=10, window_seconds=60):
            messages.error(request, "Rate limit exceeded. Please try again shortly.")
            return redirect("home")
        form = GuestLinkForm(request.POST)
        if form.is_valid():
            created_link = form.save(commit=False)
            created_link.guest_email = form.cleaned_data["email"]
            created_link.save()
            created_short_url = created_link.short_url(request)
            messages.success(request, "Short link created.")
    return render(
        request,
        "home.html",
        {
            "highlights": HIGHLIGHTS,
            "form": form,
            "created_link": created_link,
            "created_short_url": created_short_url,
        },
    )


def pricing(request: HttpRequest) -> HttpResponse:
    tiers = [
        {
            "name": "Free (Normal)",
            "price": "$0",
            "features": [
                "Basic redirects and branded short links",
                "Ad-supported experience for visitors",
                "Standard analytics and link history",
            ],
            "cta": "Start free",
        },
        {
            "name": "Premium",
            "price": "$19",
            "features": [
                "No ads for you or your visitors",
                "Custom domains, password-protected links, and QR codes",
                "Advanced analytics exports and priority support",
                "Advanced link controls and privacy settings",
            ],
            "cta": "Upgrade to Premium",
        },
    ]
    return render(request, "pricing.html", {"tiers": tiers})


def login_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = LoginForm(request, data=request.POST or None)
    next_url = request.POST.get("next") or request.GET.get("next")
    if next_url and not url_has_allowed_host_and_scheme(
        next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        next_url = None
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        return redirect(next_url or "dashboard")
    return render(request, "login.html", {"form": form, "next": next_url})


def register(request: HttpRequest) -> HttpResponse:
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        user = authenticate(username=user.username, password=form.cleaned_data["password1"])
        if user:
            login(request, user)
        return redirect("dashboard")
    return render(request, "register.html", {"form": form})


def logout_view(request: HttpRequest) -> HttpResponse:
    logout(request)
    return redirect("home")


@login_required
def dashboard(request: HttpRequest) -> HttpResponse:
    profile = request.user.profile
    is_premium = profile.is_premium()
    form = LinkForm(user=request.user, is_premium=is_premium)
    if request.method == "POST":
        form = LinkForm(request.POST, user=request.user, is_premium=is_premium)
        if form.is_valid():
            link = form.save(commit=False)
            link.user = request.user
            link.save()
            form.save_m2m()
            if is_premium:
                link.generate_qr_code(link.short_url(request))
                link.save(update_fields=["qr_code_image"])
            messages.success(request, "Short link created.")
            return redirect("dashboard")
    link_qs = Link.objects.filter(user=request.user)
    recent_links = link_qs.order_by("-created_at")[:5]
    total_links = link_qs.count()
    active_links = link_qs.filter(is_active=True).count()
    paused_links = link_qs.filter(is_active=False).count()
    clicks_week = ClickEvent.objects.filter(
        link__user=request.user,
        created_at__gte=timezone.now() - timedelta(days=7),
    ).count()
    clicks_by_day_qs = (
        ClickEvent.objects.filter(
            link__user=request.user,
            created_at__gte=timezone.now() - timedelta(days=14),
        )
        .annotate(date=models.functions.TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    clicks_by_day = [{"date": item["date"].isoformat(), "count": item["count"]} for item in clicks_by_day_qs]
    device_counts = list(
        ClickEvent.objects.filter(link__user=request.user)
        .values("device")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    browser_counts = list(
        ClickEvent.objects.filter(link__user=request.user)
        .values("browser")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    country_counts = list(
        ClickEvent.objects.filter(link__user=request.user)
        .values("country")
        .annotate(count=Count("id"))
        .order_by("-count")[:5]
    )

    context = {
        "form": form,
        "recent_links": recent_links,
        "total_links": total_links,
        "active_links": active_links,
        "paused_links": paused_links,
        "clicks_week": clicks_week,
        "clicks_by_day": json.dumps(clicks_by_day),
        "device_counts": json.dumps(device_counts),
        "browser_counts": json.dumps(browser_counts),
        "country_counts": country_counts,
        "is_premium": is_premium,
        "plan": "Premium" if is_premium else "Free",
        "ad_enabled": not is_premium,
    }
    return render(request, "dashboard.html", context)


@login_required
@require_http_methods(["GET"])
def dashboard_links_data(request: HttpRequest) -> JsonResponse:
    link_qs = Link.objects.filter(user=request.user).annotate(clicks_count=Count("clicks"))
    query = request.GET.get("q", "").strip()
    if query:
        link_qs = link_qs.filter(Q(title__icontains=query) | Q(slug__icontains=query))

    status = request.GET.get("status", "").strip()
    now = timezone.now()
    if status == "active":
        link_qs = link_qs.filter(is_active=True).filter(
            Q(starts_at__isnull=True) | Q(starts_at__lte=now),
            Q(expires_at__isnull=True) | Q(expires_at__gt=now),
        )
    elif status == "paused":
        link_qs = link_qs.filter(is_active=False)
    elif status == "expired":
        link_qs = link_qs.filter(is_active=True, expires_at__isnull=False, expires_at__lte=now)

    sort = request.GET.get("sort", "created_desc").strip()
    if sort == "created_asc":
        link_qs = link_qs.order_by("created_at")
    elif sort == "clicks_desc":
        link_qs = link_qs.order_by("-clicks_count", "-created_at")
    elif sort == "clicks_asc":
        link_qs = link_qs.order_by("clicks_count", "-created_at")
    else:
        link_qs = link_qs.order_by("-created_at")

    try:
        page = max(int(request.GET.get("page", 1)), 1)
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = int(request.GET.get("page_size", 10))
    except (TypeError, ValueError):
        page_size = 10
    if page_size not in {10, 25, 50}:
        page_size = 10

    paginator = Paginator(link_qs, page_size)
    page_obj = paginator.get_page(page)
    results = []
    for link in page_obj.object_list:
        if link.is_active:
            if link.expires_at and link.expires_at <= now:
                status_label = "Expired"
                status_class = "badge-status-expired"
            elif link.starts_at and link.starts_at > now:
                status_label = "Scheduled"
                status_class = "badge-status-scheduled"
            else:
                status_label = "Active"
                status_class = "badge-status-active"
        else:
            status_label = "Paused"
            status_class = "badge-status-paused"
        results.append(
            {
                "slug": link.slug,
                "short_url": link.short_url(request),
                "destination_url": link.destination_url,
                "clicks": link.clicks_count,
                "created_at": link.created_at.strftime("%b %d, %Y"),
                "is_available": link.is_available(),
                "status_label": status_label,
                "status_class": status_class,
                "edit_url": reverse("link_edit", args=[link.slug]),
                "delete_url": reverse("link_delete", args=[link.slug]),
                "detail_url": reverse("link_detail", args=[link.slug]),
            }
        )

    return JsonResponse(
        {
            "page": page_obj.number,
            "page_size": page_size,
            "total": paginator.count,
            "total_pages": paginator.num_pages,
            "results": results,
        }
    )


@login_required
def link_detail(request: HttpRequest, slug: str) -> HttpResponse:
    link = get_object_or_404(Link, slug=slug, user=request.user)
    profile = request.user.profile
    is_premium = profile.is_premium()
    clicks = link.clicks.order_by("-created_at")[:50]
    totals = link.clicks.count()
    by_date_qs = (
        link.clicks.annotate(date=models.functions.TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    by_date = [{"date": item["date"].isoformat(), "count": item["count"]} for item in by_date_qs]
    referrer_counts = Counter(click.referrer or "Direct" for click in link.clicks.all())
    device_counts = list(link.clicks.values("device").annotate(count=Count("id")).order_by("-count"))
    browser_counts = list(link.clicks.values("browser").annotate(count=Count("id")).order_by("-count"))
    country_counts = list(link.clicks.values("country").annotate(count=Count("id")).order_by("-count")[:5])
    context = {
        "link": link,
        "clicks": clicks,
        "totals": totals,
        "by_date": json.dumps(by_date),
        "referrers": referrer_counts.most_common(5) if is_premium else [],
        "is_premium": is_premium,
        "device_counts": json.dumps(device_counts),
        "browser_counts": json.dumps(browser_counts),
        "country_counts": country_counts,
    }
    return render(request, "link_detail.html", context)


@login_required
def link_edit(request: HttpRequest, slug: str) -> HttpResponse:
    link = get_object_or_404(Link, slug=slug, user=request.user)
    form = LinkForm(instance=link, user=request.user, is_premium=request.user.profile.is_premium())
    if request.method == "POST":
        form = LinkForm(
            request.POST,
            instance=link,
            user=request.user,
            is_premium=request.user.profile.is_premium(),
        )
        if form.is_valid():
            previous_url = link.destination_url
            updated_link = form.save()
            if previous_url != updated_link.destination_url:
                LinkDestinationChange.objects.create(
                    link=updated_link,
                    previous_url=previous_url,
                    new_url=updated_link.destination_url,
                    changed_by=request.user,
                )
                updated_link.last_destination_change_at = timezone.now()
                updated_link.destination_change_count += 1
                updated_link.save(update_fields=["last_destination_change_at", "destination_change_count"])
            if request.user.profile.is_premium():
                updated_link.generate_qr_code(updated_link.short_url(request))
                updated_link.save(update_fields=["qr_code_image"])
            messages.success(request, "Link updated.")
            return redirect("link_detail", slug=link.slug)
    return render(request, "link_edit.html", {"form": form, "link": link})


@login_required
@require_http_methods(["POST"])
def link_delete(request: HttpRequest, slug: str) -> HttpResponse:
    link = get_object_or_404(Link, slug=slug, user=request.user)
    link.is_active = False
    link.save(update_fields=["is_active"])
    messages.warning(request, "Link disabled.")
    return redirect("dashboard")


@login_required
def api_keys(request: HttpRequest) -> HttpResponse:
    profile = request.user.profile
    if request.method == "POST":
        if not profile.is_premium():
            messages.error(request, "Upgrade to premium to use API access.")
            return redirect("api_keys")
        profile.ensure_api_key()
        messages.success(request, "API key generated.")
    return render(request, "api_keys.html", {"api_key": profile.api_key, "is_premium": profile.is_premium()})


@login_required
def custom_domains(request: HttpRequest) -> HttpResponse:
    profile = request.user.profile
    if not profile.is_premium():
        messages.error(request, "Upgrade to premium to manage custom domains.")
        return redirect("dashboard")
    if request.method == "POST":
        domain = request.POST.get("domain", "").strip().lower()
        if domain:
            CustomDomain.objects.get_or_create(user=request.user, domain=domain)
            messages.success(request, "Domain added. Verification pending.")
    domains = CustomDomain.objects.filter(user=request.user)
    return render(request, "custom_domains.html", {"domains": domains, "is_premium": profile.is_premium()})


@login_required
def billing(request: HttpRequest) -> HttpResponse:
    profile = request.user.profile
    return render(request, "billing.html", {"profile": profile, "is_premium": profile.is_premium()})


@login_required
@require_http_methods(["GET"])
def start_checkout(request: HttpRequest) -> HttpResponseRedirect:
    checkout_url = os.environ.get("RAZORPAY_CHECKOUT_URL", "").strip()
    plan = request.GET.get("plan", "").strip()
    if not checkout_url:
        messages.error(request, "Payment checkout is not configured yet. Please contact support.")
        return redirect("billing")
    if plan:
        separator = "&" if "?" in checkout_url else "?"
        checkout_url = f"{checkout_url}{separator}plan={plan}"
    return redirect(checkout_url)


def redirect_link(request: HttpRequest, slug: str) -> HttpResponseRedirect:
    host = request.get_host().split(":")[0]
    link = Link.objects.filter(slug=slug).select_related("custom_domain").first()
    if link and link.custom_domain and link.custom_domain.domain != host:
        link = Link.objects.filter(slug=slug, custom_domain__domain=host).first()
    if not link:
        return redirect("home")
    if not link.is_available():
        messages.error(request, "This link is inactive or expired.")
        return redirect("home")
    record_click(request, link)
    return redirect(link.destination_url, permanent=link.redirect_type == Link.REDIRECT_301)


def privacy(request: HttpRequest) -> HttpResponse:
    return render(request, "privacy.html")


def cookies(request: HttpRequest) -> HttpResponse:
    return render(request, "cookies.html")


def terms(request: HttpRequest) -> HttpResponse:
    return render(request, "terms.html")


@csrf_exempt
@require_http_methods(["POST"])
def api_create_link(request: HttpRequest) -> JsonResponse:
    api_key = request.headers.get("X-API-Key") or request.POST.get("api_key")
    user_profile = UserProfile.objects.filter(api_key=api_key).select_related("user").first()
    if not user_profile:
        return JsonResponse({"error": "Invalid API key"}, status=401)
    if not user_profile.is_premium():
        return JsonResponse({"error": "Premium plan required"}, status=403)
    if not rate_limit(f"api:{api_key}", limit=30, window_seconds=60):
        return JsonResponse({"error": "Rate limit exceeded"}, status=429)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload"}, status=400)
    link = Link(
        user=user_profile.user,
        destination_url=payload.get("destination_url", ""),
        slug=payload.get("slug") or "",
        title=payload.get("title", ""),
    )
    if not link.slug:
        link.slug = generate_unique_slug()
    try:
        link.full_clean()
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    link.save()
    link.generate_qr_code(link.short_url(request))
    link.save(update_fields=["qr_code_image"])
    return JsonResponse({"slug": link.slug, "short_url": link.short_url(request)})


@require_http_methods(["GET"])
def api_link_detail(request: HttpRequest, slug: str) -> JsonResponse:
    api_key = request.headers.get("X-API-Key") or request.GET.get("api_key")
    user_profile = UserProfile.objects.filter(api_key=api_key).select_related("user").first()
    if not user_profile:
        return JsonResponse({"error": "Invalid API key"}, status=401)
    if not user_profile.is_premium():
        return JsonResponse({"error": "Premium plan required"}, status=403)
    link = get_object_or_404(Link, slug=slug, user=user_profile.user)
    return JsonResponse(
        {
            "slug": link.slug,
            "destination_url": link.destination_url,
            "clicks": link.clicks.count(),
            "created_at": link.created_at.isoformat(),
            "expires_at": link.expires_at.isoformat() if link.expires_at else None,
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def razorpay_webhook(request: HttpRequest) -> JsonResponse:
    signature = request.headers.get("X-Razorpay-Signature", "")
    secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
    body = request.body
    expected_signature = hmac.new(secret.encode(), body, sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        return JsonResponse({"error": "Invalid signature"}, status=400)
    payload = json.loads(body.decode("utf-8"))
    event = payload.get("event", "")
    event_id = payload.get("id", "")
    user_id = payload.get("payload", {}).get("payment", {}).get("entity", {}).get("notes", {}).get("user_id")
    plan = payload.get("payload", {}).get("payment", {}).get("entity", {}).get("notes", {}).get("plan")
    amount = payload.get("payload", {}).get("payment", {}).get("entity", {}).get("amount", 0)
    if user_id:
        user_profile = UserProfile.objects.filter(user_id=user_id).first()
        if user_profile:
            user_profile.subscription_active = event == "payment.captured"
            if user_profile.subscription_active:
                user_profile.plan = UserProfile.PLAN_PREMIUM
                user_profile.subscription_ends_at = timezone.now() + timedelta(days=30)
            else:
                user_profile.grace_period_ends_at = timezone.now() + timedelta(days=7)
            user_profile.save()
            SubscriptionEvent.objects.create(
                user=user_profile.user,
                status=event,
                plan=plan or "",
                amount=amount,
                razorpay_event_id=event_id,
                payload=payload,
            )
    return JsonResponse({"status": "ok"})


def rate_limit(cache_key: str, limit: int, window_seconds: int) -> bool:
    current = cache.get(cache_key, 0)
    if current >= limit:
        return False
    cache.set(cache_key, current + 1, timeout=window_seconds)
    return True


def record_click(request: HttpRequest, link: Link) -> None:
    user_agent = request.META.get("HTTP_USER_AGENT", "")
    referrer = request.META.get("HTTP_REFERER", "")
    device, browser = parse_user_agent(user_agent)
    country = (
        request.META.get("HTTP_CF_IPCOUNTRY")
        or request.META.get("HTTP_X_COUNTRY_CODE")
        or request.META.get("GEOIP_COUNTRY_NAME", "")
    )
    ClickEvent.objects.create(
        link=link,
        referrer=referrer,
        ip_address=get_client_ip(request),
        user_agent=user_agent[:255],
        device=device,
        browser=browser,
        country=country,
        is_qr=request.GET.get("qr") == "1",
    )


def get_client_ip(request: HttpRequest) -> str | None:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def parse_user_agent(user_agent: str) -> tuple[str, str]:
    ua = user_agent.lower()
    browser = "Other"
    if "chrome" in ua:
        browser = "Chrome"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    device = "Desktop"
    if "mobile" in ua:
        device = "Mobile"
    elif "tablet" in ua:
        device = "Tablet"
    return device, browser
