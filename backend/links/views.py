import razorpay
from django.conf import settings
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Link
from .serializers import LinkSerializer


class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all().order_by('-created_at')
    serializer_class = LinkSerializer
    permission_classes = [permissions.AllowAny]


class RazorpayOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'INR')
        receipt = request.data.get('receipt', 'pulselink-order')

        if not amount:
            return Response({'detail': 'amount is required'}, status=400)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({'amount': int(amount), 'currency': currency, 'receipt': receipt})
        return Response(order)
