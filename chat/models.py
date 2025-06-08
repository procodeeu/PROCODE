from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

def generate_conversation_id():
    return f"cm{uuid.uuid4().hex[:20]}"

def generate_message_id():
    return f"cm{uuid.uuid4().hex[:20]}"

def generate_proactive_id():
    return f"cm{uuid.uuid4().hex[:20]}"

class Conversation(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default=generate_conversation_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=200, default='New Conversation')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    id = models.CharField(primary_key=True, max_length=50, default=generate_message_id)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    model_used = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.conversation.title} - {self.role}: {self.content[:50]}"

class ProactiveMessage(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    id = models.CharField(primary_key=True, max_length=50, default=generate_proactive_id)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proactive_messages')
    content = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    scheduled_for = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Proactive for {self.user.email}: {self.content[:50]}"