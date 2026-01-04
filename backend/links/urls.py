from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LinkViewSet, RazorpayOrderView

router = DefaultRouter()
router.register('links', LinkViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('payments/razorpay/order/', RazorpayOrderView.as_view(), name='razorpay-order'),
]
