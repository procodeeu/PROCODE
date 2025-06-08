from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('context/', views.get_user_context, name='get_user_context'),
    path('context/update/', views.update_user_context, name='update_user_context'),
    path('current-model/', views.get_current_model, name='get_current_model'),
    path('current-model/update/', views.update_current_model, name='update_current_model'),
    path('preferred-models/', views.get_preferred_models, name='get_preferred_models'),
    path('preferred-models/update/', views.update_preferred_models, name='update_preferred_models'),
]