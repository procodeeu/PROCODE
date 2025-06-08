from django.contrib import admin
from .models import TelegramConnection

@admin.register(TelegramConnection)
class TelegramConnectionAdmin(admin.ModelAdmin):
    list_display = ('user', 'telegram_username', 'is_active', 'connected_at', 'last_message_at', 'created_at')
    list_filter = ('is_active', 'connected_at', 'created_at')
    search_fields = ('user__email', 'user__username', 'telegram_username', 'telegram_chat_id')
    readonly_fields = ('id', 'connection_token', 'created_at')
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('user',)
        return self.readonly_fields