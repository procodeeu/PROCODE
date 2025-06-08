from django.urls import path
from . import views

urlpatterns = [
    path('generate-token/', views.generate_telegram_token, name='generate_telegram_token'),
    path('status/', views.get_telegram_status, name='get_telegram_status'),
]