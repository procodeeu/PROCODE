import requests
import json
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    conversations = Conversation.objects.filter(user=request.user, is_active=True)
    return Response(ConversationSerializer(conversations, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    title = request.data.get('title', 'New Conversation')
    conversation = Conversation.objects.create(
        user=request.user,
        title=title
    )
    return Response(ConversationSerializer(conversation).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        messages = conversation.messages.all()
        return Response({
            'conversation': ConversationSerializer(conversation).data,
            'messages': MessageSerializer(messages, many=True).data
        })
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user_message = request.data.get('message', '')
    if not user_message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save user message
    user_msg = Message.objects.create(
        conversation=conversation,
        role='user',
        content=user_message
    )
    
    # Get AI response
    try:
        ai_response = get_ai_response(user_message, conversation, request.user)
        
        # Save AI message
        ai_msg = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response,
            model_used=request.user.current_model
        )
        
        # Update conversation timestamp
        conversation.save()
        
        return Response({
            'userMessage': MessageSerializer(user_msg).data,
            'assistantMessage': MessageSerializer(ai_msg).data
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_ai_response(message, conversation, user):
    """Get AI response from OpenRouter"""
    # Get conversation history
    messages = conversation.messages.all()[:10]  # Last 10 messages for context
    
    # Build message history for AI
    ai_messages = []
    
    # Add system message with user context
    system_content = "Jesteś pomocnym asystentem AI w aplikacji PROCODE. Odpowiadaj po polsku, bądź rzeczowy i pomocny."
    if hasattr(user, 'context') and user.context.content:
        system_content += f"\n\nKontekst użytkownika: {user.context.content}"
    
    ai_messages.append({
        "role": "system",
        "content": system_content
    })
    
    # Add conversation history
    for msg in messages:
        ai_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Add current message
    ai_messages.append({
        "role": "user",
        "content": message
    })
    
    # Call OpenRouter API
    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {settings.OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'X-Title': 'PROCODE Django App'
        },
        json={
            'model': user.current_model,
            'messages': ai_messages,
            'max_tokens': 1000,
            'temperature': 0.7
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['choices'][0]['message']['content']
    else:
        raise Exception(f"AI API error: {response.status_code}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_models(request):
    """Get available AI models from OpenRouter"""
    try:
        response = requests.get(
            'https://openrouter.ai/api/v1/models',
            headers={
                'Authorization': f'Bearer {settings.OPENROUTER_API_KEY}',
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            models = []
            for model in data.get('data', []):
                models.append({
                    'id': model['id'],
                    'name': model.get('name', model['id']),
                    'description': model.get('description', ''),
                    'pricing': model.get('pricing', {})
                })
            return Response({'models': models})
        else:
            return Response({'error': 'Failed to fetch models'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)