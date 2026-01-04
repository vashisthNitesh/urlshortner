from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ClickEventViewSet, DomainViewSet, LinkViewSet, RazorpayOrderView, TrackLinkView

router = DefaultRouter()
router.register('links', LinkViewSet)
router.register('domains', DomainViewSet)
router.register('click-events', ClickEventViewSet, basename='click-event')

urlpatterns = [
    path('', include(router.urls)),
    path('payments/razorpay/order/', RazorpayOrderView.as_view(), name='razorpay-order'),
    path('r/<slug:slug>/', TrackLinkView.as_view(), name='link-redirect'),
]
