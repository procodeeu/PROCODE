from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

def generate_user_id():
    return f"cm{uuid.uuid4().hex[:20]}"

def generate_context_id():
    return f"cm{uuid.uuid4().hex[:20]}"

class User(AbstractUser):
    id = models.CharField(primary_key=True, max_length=50, default=generate_user_id)
    email = models.EmailField(unique=True)
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)
    telegram_username = models.CharField(max_length=100, blank=True, null=True)
    current_model = models.CharField(max_length=100, default='anthropic/claude-3.5-sonnet')
    preferred_models = models.JSONField(default=list, blank=True)
    life_context = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class UserContext(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default=generate_context_id)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='context')
    content = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Context for {self.user.email}"