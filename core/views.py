import jwt
from datetime import datetime, timedelta
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import User, UserContext
from .serializers import UserSerializer, UserContextSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    username = request.data.get('username', email.split('@')[0])
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    # Create JWT token
    payload = {
        'userId': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
    
    response = Response({
        'success': True,
        'user': UserSerializer(user).data
    })
    response.set_cookie('auth-token', token, max_age=7*24*60*60, httponly=True)
    
    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    # Clear any existing authentication for this request
    request._force_auth_user = None
    request._force_auth_token = None
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            payload = {
                'userId': user.id,
                'exp': datetime.utcnow() + timedelta(days=7)
            }
            token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
            
            response = Response({
                'success': True,
                'user': UserSerializer(user).data
            })
            response.set_cookie('auth-token', token, max_age=7*24*60*60, httponly=True)
            return response
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    response = Response({'success': True})
    response.delete_cookie('auth-token')
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_context(request):
    try:
        context = UserContext.objects.get(user=request.user)
        return Response(UserContextSerializer(context).data)
    except UserContext.DoesNotExist:
        return Response({'content': ''})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_context(request):
    content = request.data.get('content', '')
    
    context, created = UserContext.objects.get_or_create(
        user=request.user,
        defaults={'content': content}
    )
    
    if not created:
        context.content = content
        context.save()
    
    return Response(UserContextSerializer(context).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_model(request):
    return Response({'currentModel': request.user.current_model})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_current_model(request):
    model = request.data.get('model')
    if model:
        request.user.current_model = model
        request.user.save()
        return Response({'success': True, 'currentModel': model})
    return Response({'error': 'Model not provided'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_preferred_models(request):
    return Response({'models': request.user.preferred_models})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_preferred_models(request):
    models = request.data.get('models', [])
    request.user.preferred_models = models
    request.user.save()
    return Response({'success': True, 'models': models})