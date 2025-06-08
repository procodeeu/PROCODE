from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserContext

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'current_model', 'telegram_username', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'telegram_username')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('telegram_chat_id', 'telegram_username', 'current_model', 'preferred_models', 'life_context')
        }),
    )

@admin.register(UserContext)
class UserContextAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')