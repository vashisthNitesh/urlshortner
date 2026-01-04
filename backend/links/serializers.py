from rest_framework import serializers

from .models import ClickEvent, Domain, Link


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ['id', 'hostname', 'verified', 'created_at']
        read_only_fields = ('id', 'verified', 'created_at')


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = [
            'id',
            'slug',
            'url',
            'title',
            'status',
            'password',
            'expires_at',
            'domain',
            'preview_safe',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}


class ClickEventSerializer(serializers.ModelSerializer):
    link_slug = serializers.CharField(source='link.slug', read_only=True)
    domain = serializers.CharField(source='link.domain.hostname', read_only=True)

    class Meta:
        model = ClickEvent
        fields = [
            'id',
            'link',
            'link_slug',
            'domain',
            'referrer',
            'device',
            'browser',
            'os',
            'country',
            'region',
            'ip_hash',
            'occurred_at',
        ]
        read_only_fields = (
            'id',
            'link',
            'link_slug',
            'domain',
            'referrer',
            'device',
            'browser',
            'os',
            'country',
            'region',
            'ip_hash',
            'occurred_at',
        )
