from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.get_conversations, name='get_conversations'),
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/<str:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/<str:conversation_id>/messages/', views.send_message, name='send_message'),
    path('models/', views.get_models, name='get_models'),
]