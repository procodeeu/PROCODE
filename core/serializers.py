from rest_framework import serializers
from .models import User, UserContext

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'current_model', 'preferred_models', 
                 'telegram_chat_id', 'telegram_username', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserContext
        fields = ['content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']