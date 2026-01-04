from rest_framework import serializers

from .models import Link


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = [
            'id',
            'slug',
            'url',
            'title',
            'status',
            'expires_at',
            'domain',
            'preview_safe',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
