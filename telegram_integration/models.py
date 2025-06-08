from django.db import models
from django.contrib.auth import get_user_model
import uuid
import secrets

User = get_user_model()

def generate_telegram_id():
    return f"cm{uuid.uuid4().hex[:20]}"

def generate_connection_token():
    return secrets.token_hex(16)

class TelegramConnection(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default=generate_telegram_id)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='telegram_connection')
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)
    telegram_username = models.CharField(max_length=100, blank=True, null=True)
    connection_token = models.CharField(max_length=64, unique=True, default=generate_connection_token)
    is_active = models.BooleanField(default=False)
    connected_at = models.DateTimeField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Telegram connection for {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.connection_token:
            self.connection_token = secrets.token_hex(16)  # 32-character token
        super().save(*args, **kwargs)