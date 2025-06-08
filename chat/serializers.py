from rest_framework import serializers
from .models import Conversation, Message, ProactiveMessage

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'model_used', 'created_at']
        read_only_fields = ['id', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'is_active', 'created_at', 'updated_at', 'message_count', 'last_message']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content[:100] + ('...' if len(last_msg.content) > 100 else ''),
                'role': last_msg.role,
                'created_at': last_msg.created_at
            }
        return None

class ProactiveMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProactiveMessage
        fields = ['id', 'content', 'status', 'scheduled_for', 'created_at', 'sent_at']
        read_only_fields = ['id', 'created_at', 'sent_at']