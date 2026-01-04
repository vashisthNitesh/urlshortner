import hashlib

import razorpay
from django.conf import settings
from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ClickEvent, Domain, Link
from .serializers import ClickEventSerializer, DomainSerializer, LinkSerializer


class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.all().order_by('hostname')
    serializer_class = DomainSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']


class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.select_related('domain').order_by('-created_at')
    serializer_class = LinkSerializer
    permission_classes = [permissions.AllowAny]


class ClickEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClickEventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = ClickEvent.objects.select_related('link', 'link__domain').order_by('-occurred_at')

        link_id = self.request.query_params.get('link')
        slug = self.request.query_params.get('slug')
        domain = self.request.query_params.get('domain')

        if link_id:
            queryset = queryset.filter(link_id=link_id)
        elif slug:
            filters = {'link__slug': slug}
            if domain:
                filters['link__domain__hostname'] = domain
            queryset = queryset.filter(**filters)

        return queryset


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


class TrackLinkView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_link(self, slug, domain_hostname=None):
        queryset = Link.objects.select_related('domain').filter(slug=slug)
        if domain_hostname:
            queryset = queryset.filter(domain__hostname=domain_hostname)
        else:
            queryset = queryset.filter(domain__isnull=True)
        return get_object_or_404(queryset)

    def get(self, request, slug, *args, **kwargs):
        domain = request.query_params.get('domain')
        link = self.get_link(slug, domain_hostname=domain)

        if link.status != 'active':
            return Response({'detail': 'Link is not active'}, status=410)

        if link.expires_at and link.expires_at <= timezone.now():
            return Response({'detail': 'Link has expired'}, status=410)

        if link.password:
            provided_password = request.query_params.get('password')
            if provided_password != link.password:
                return Response({'detail': 'Password required'}, status=403)

        user_agent = request.META.get('HTTP_USER_AGENT', '')[:255]
        referrer = request.META.get('HTTP_REFERER', '')[:255]
        ip_address = request.META.get('REMOTE_ADDR', '')
        ip_hash = hashlib.sha256(ip_address.encode('utf-8')).hexdigest() if ip_address else None

        ClickEvent.objects.create(
            link=link,
            referrer=referrer or None,
            browser=user_agent or None,
            ip_hash=ip_hash,
        )

        return redirect(link.url)
