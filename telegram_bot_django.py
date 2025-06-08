#!/usr/bin/env python
import os
import sys
import django
import asyncio
import logging
from datetime import datetime, timezone

# Setup Django
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'procode.settings')
django.setup()

from django.contrib.auth import get_user_model
from telegram_integration.models import TelegramConnection
from chat.models import Conversation, Message, ProactiveMessage
from chat.views import get_ai_response
import requests
import json

User = get_user_model()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self, token):
        self.token = token
        self.api_url = f"https://api.telegram.org/bot{token}"
        self.offset = 0
        
    def get_updates(self):
        """Get updates from Telegram"""
        url = f"{self.api_url}/getUpdates"
        params = {'offset': self.offset, 'timeout': 10}
        
        try:
            response = requests.get(url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data['ok']:
                    return data['result']
            else:
                logger.error(f"Failed to get updates: {response.status_code}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
        
        return []
    
    def send_message(self, chat_id, text):
        """Send message to Telegram chat"""
        url = f"{self.api_url}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send message: {e}")
            return False
    
    def send_chat_action(self, chat_id, action='typing'):
        """Send chat action (typing indicator)"""
        url = f"{self.api_url}/sendChatAction"
        data = {'chat_id': chat_id, 'action': action}
        
        try:
            requests.post(url, json=data, timeout=5)
        except requests.exceptions.RequestException:
            pass
    
    def handle_message(self, message):
        """Handle incoming message"""
        chat_id = str(message['chat']['id'])
        text = message.get('text', '').strip()
        user_data = message['from']
        username = user_data.get('username') or user_data.get('first_name', 'Unknown')
        
        logger.info(f"📩 Message from {username} ({chat_id}): {text}")
        
        try:
            if text.startswith('/connect '):
                self.handle_connect_command(chat_id, text, username)
            elif text == '/start':
                self.handle_start_command(chat_id)
            else:
                self.handle_user_message(chat_id, text, username)
                
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            self.send_message(chat_id, '❌ Wystąpił błąd. Spróbuj ponownie.')
    
    def handle_connect_command(self, chat_id, text, username):
        """Handle /connect command"""
        logger.info(f"🔥 DETECTED /connect command from {username}")
        
        token = text.replace('/connect ', '').strip()
        logger.info(f"🔍 Extracted token: '{token}' (length: {len(token)})")
        
        try:
            # Find connection by token
            connection = TelegramConnection.objects.select_related('user').get(
                connection_token=token
            )
            
            logger.info(f"🔍 Found connection for user: {connection.user.email}")
            
            # Update connection
            connection.telegram_chat_id = chat_id
            connection.telegram_username = username
            connection.is_active = True
            connection.connected_at = datetime.now(timezone.utc)
            connection.last_message_at = datetime.now(timezone.utc)
            connection.save()
            
            # Update user record
            user = connection.user
            user.telegram_chat_id = chat_id
            user.telegram_username = username
            user.save()
            
            success_message = (
                "✅ Połączenie udane!\n\n"
                "Twój Telegram jest teraz połączony z PROCODE AI.\n\n"
                "🤖 Będziesz otrzymywać proaktywne wiadomości na podstawie Twojego kontekstu życiowego.\n\n"
                "💡 Aby uzyskać maksymalne korzyści, uzupełnij swój kontekst w aplikacji: Mój Kontekst.\n\n"
                "Witaj w systemie inteligentnych powiadomień! 🚀"
            )
            
            self.send_message(chat_id, success_message)
            logger.info(f"✅ User {connection.user.email} connected with chat ID {chat_id}")
            
        except TelegramConnection.DoesNotExist:
            logger.info(f"❌ Token not found: {token}")
            self.send_message(chat_id, '❌ Token nieprawidłowy lub wygasł. Wygeneruj nowy token w aplikacji.')
        except Exception as e:
            logger.error(f"Error in connect command: {e}")
            self.send_message(chat_id, '❌ Wystąpił błąd podczas łączenia. Spróbuj ponownie.')
    
    def handle_start_command(self, chat_id):
        """Handle /start command"""
        start_message = (
            "🤖 Witaj w PROCODE AI Bot!\n\n"
            "Aby połączyć swój Telegram z aplikacją:\n\n"
            "1️⃣ Zaloguj się do aplikacji PROCODE\n"
            "2️⃣ Przejdź do Dashboard\n"
            "3️⃣ Kliknij \"Połącz z Telegram\"\n"
            "4️⃣ Skopiuj token i wyślij mi komendę:\n"
            "   /connect [twój-token]\n\n"
            "Po połączeniu będziesz otrzymywać inteligentne powiadomienia! 🚀"
        )
        
        self.send_message(chat_id, start_message)
    
    def handle_user_message(self, chat_id, text, username):
        """Handle regular user message"""
        try:
            # Check if user is connected
            connection = TelegramConnection.objects.select_related('user').get(
                telegram_chat_id=chat_id,
                is_active=True
            )
            
            # Update last message time
            connection.last_message_at = datetime.now(timezone.utc)
            connection.save()
            
            # Send typing indicator
            self.send_chat_action(chat_id, 'typing')
            
            # Get or create Telegram conversation
            conversation, created = Conversation.objects.get_or_create(
                user=connection.user,
                title='Telegram Chat',
                defaults={'is_active': True}
            )
            
            # Save user message
            user_message = Message.objects.create(
                conversation=conversation,
                role='user',
                content=text
            )
            
            # Get AI response
            ai_response = self.get_ai_response_for_telegram(text, conversation, connection.user)
            
            # Save AI message
            Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=ai_response,
                model_used=connection.user.current_model
            )
            
            # Update conversation timestamp
            conversation.save()
            
            # Send response
            self.send_message(chat_id, f"🤖 {ai_response}")
            
            logger.info(f"💬 Handled message from {connection.user.email} ({chat_id}): \"{text}\"")
            
        except TelegramConnection.DoesNotExist:
            not_connected_message = (
                f"🆔 Twój Chat ID: {chat_id}\n\n"
                "❌ Twój Telegram nie jest połączony z aplikacją. "
                "Wyślij /start aby otrzymać instrukcje."
            )
            self.send_message(chat_id, not_connected_message)
        except Exception as e:
            logger.error(f"Error handling user message: {e}")
            self.send_message(chat_id, '❌ Wystąpił błąd podczas przetwarzania wiadomości. Spróbuj ponownie.')
    
    def get_ai_response_for_telegram(self, message, conversation, user):
        """Get AI response for Telegram message"""
        try:
            # Get conversation history (last 10 messages)
            messages = list(conversation.messages.all()[:10])
            
            # Build AI messages
            ai_messages = []
            
            # System message
            system_content = (
                "Jesteś pomocnym asystentem AI w aplikacji PROCODE. "
                "Odpowiadaj po polsku, bądź rzeczowy i pomocny. "
                "Używaj emotikonów gdzie to odpowiednie."
            )
            
            # Add user context if available
            if hasattr(user, 'context') and user.context and user.context.content:
                system_content += f"\n\nKontekst użytkownika: {user.context.content}"
            
            ai_messages.append({
                "role": "system",
                "content": system_content
            })
            
            # Add conversation history
            for msg in messages:
                if msg.content != message:  # Don't include the current message yet
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
            openrouter_key = os.getenv('OPENROUTER_API_KEY')
            if not openrouter_key:
                return "Przepraszam, brak konfiguracji API. Skontaktuj się z administratorem."
            
            response = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {openrouter_key}',
                    'Content-Type': 'application/json',
                    'X-Title': 'PROCODE Telegram Bot'
                },
                json={
                    'model': user.current_model,
                    'messages': ai_messages,
                    'max_tokens': 1000,
                    'temperature': 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                logger.error(f"OpenRouter API error: {response.status_code}")
                return "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie."
                
        except Exception as e:
            logger.error(f"Error getting AI response: {e}")
            return "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie."
    
    def process_pending_messages(self):
        """Process pending proactive messages"""
        try:
            # Get pending messages
            pending_messages = ProactiveMessage.objects.select_related('user').filter(
                status='pending',
                user__telegram_connection__is_active=True
            )
            
            for message in pending_messages[:10]:  # Process max 10 at a time
                try:
                    chat_id = message.user.telegram_chat_id
                    if chat_id and self.send_message(chat_id, message.content):
                        message.status = 'sent'
                        message.sent_at = datetime.now(timezone.utc)
                        message.save()
                        logger.info(f"📤 Sent proactive message {message.id} to {chat_id}")
                    else:
                        message.status = 'failed'
                        message.save()
                        
                except Exception as e:
                    logger.error(f"Error sending message {message.id}: {e}")
                    message.status = 'failed'
                    message.save()
        
        except Exception as e:
            logger.error(f"Error processing pending messages: {e}")
    
    def run(self):
        """Main bot loop"""
        logger.info("🚀 Telegram Bot starting...")
        
        # Test bot token
        test_url = f"{self.api_url}/getMe"
        try:
            response = requests.get(test_url, timeout=10)
            if response.status_code == 200:
                bot_info = response.json()
                if bot_info['ok']:
                    logger.info(f"✅ Bot connected: @{bot_info['result']['username']}")
                else:
                    logger.error("❌ Invalid bot token")
                    return
            else:
                logger.error(f"❌ Bot connection failed: {response.status_code}")
                return
        except Exception as e:
            logger.error(f"❌ Bot connection error: {e}")
            return
        
        logger.info("📡 Polling for messages...")
        
        message_check_counter = 0
        
        while True:
            try:
                # Get updates
                updates = self.get_updates()
                
                for update in updates:
                    if 'message' in update:
                        self.handle_message(update['message'])
                    
                    # Update offset
                    self.offset = update['update_id'] + 1
                
                # Process pending messages every 30 iterations (roughly 30 seconds)
                message_check_counter += 1
                if message_check_counter >= 30:
                    self.process_pending_messages()
                    message_check_counter = 0
                
                # Small delay to prevent rate limiting
                import time
                time.sleep(1)
                
            except KeyboardInterrupt:
                logger.info("🛑 Bot stopped by user")
                break
            except Exception as e:
                logger.error(f"❌ Unexpected error: {e}")
                import time
                time.sleep(5)  # Wait before retrying

if __name__ == "__main__":
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        logger.error("❌ TELEGRAM_BOT_TOKEN environment variable not set")
        sys.exit(1)
    
    bot = TelegramBot(bot_token)
    bot.run()