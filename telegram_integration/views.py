from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import TelegramConnection
from .serializers import TelegramConnectionSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_telegram_token(request):
    """Generate or regenerate Telegram connection token"""
    
    # Delete any existing connection for this user
    TelegramConnection.objects.filter(user=request.user).delete()
    
    # Create new connection with token
    connection = TelegramConnection.objects.create(user=request.user)
    
    return Response({
        'success': True,
        'token': connection.connection_token,
        'instructions': {
            'step1': 'Skopiuj poniższy token',
            'step2': 'Otwórz Telegram i znajdź @procodeeu_bot',
            'step3': f'Wyślij do bota komendę: /connect {connection.connection_token}',
            'step4': 'Bot potwierdzi połączenie i możesz zacząć otrzymywać proaktywne wiadomości',
            'exampleCommand': f'/connect {connection.connection_token}'
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_telegram_status(request):
    """Get current Telegram connection status"""
    try:
        connection = TelegramConnection.objects.get(user=request.user)
        return Response({
            'connected': connection.is_active,
            'telegram_username': connection.telegram_username,
            'connected_at': connection.connected_at,
            'last_message_at': connection.last_message_at
        })
    except TelegramConnection.DoesNotExist:
        return Response({
            'connected': False,
            'telegram_username': None,
            'connected_at': None,
            'last_message_at': None
        })