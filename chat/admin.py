from django.contrib import admin
from .models import Conversation, Message, ProactiveMessage

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'user__email', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'role', 'content_preview', 'model_used', 'created_at')
    list_filter = ('role', 'model_used', 'created_at')
    search_fields = ('content', 'conversation__title', 'conversation__user__email')
    readonly_fields = ('id', 'created_at')
    
    def content_preview(self, obj):
        return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
    content_preview.short_description = 'Content Preview'

@admin.register(ProactiveMessage)
class ProactiveMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'content_preview', 'scheduled_for', 'created_at', 'sent_at')
    list_filter = ('status', 'created_at', 'sent_at')
    search_fields = ('content', 'user__email', 'user__username')
    readonly_fields = ('id', 'created_at', 'sent_at')
    
    def content_preview(self, obj):
        return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
    content_preview.short_description = 'Content Preview'