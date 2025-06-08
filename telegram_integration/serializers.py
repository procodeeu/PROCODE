from rest_framework import serializers
from .models import TelegramConnection

class TelegramConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramConnection
        fields = ['telegram_username', 'is_active', 'connected_at', 'last_message_at', 'created_at']
        read_only_fields = ['created_at']