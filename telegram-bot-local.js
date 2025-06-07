const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('pg');

// Configuration from environment
const token = process.env.TELEGRAM_BOT_TOKEN || '7803412240:AAGbRkcgSksLjLEg_-HQsu190s2Pj6hyUlw';
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/procode';

// Database client
const dbClient = new Client({ connectionString: dbUrl });

// Telegram bot
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot Microservice starting...');

// Initialize database connection
async function initDatabase() {
  try {
    await dbClient.connect();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text?.trim() || '';
  const username = msg.from.username || msg.from.first_name;
  
  console.log(`📩 Message from ${username} (${chatId}): ${text}`);
  
  try {
    // Handle /connect command
    if (text.startsWith('/connect ')) {
      const token = text.replace('/connect ', '').trim();
      await handleConnectCommand(chatId, token, username);
      return;
    }
    
    // Handle /start command
    if (text === '/start') {
      await bot.sendMessage(chatId, `🤖 Witaj w PROCODE AI Bot!\n\nAby połączyć swój Telegram z aplikacją:\n\n1️⃣ Zaloguj się do aplikacji PROCODE\n2️⃣ Przejdź do Dashboard\n3️⃣ Kliknij "Połącz z Telegram"\n4️⃣ Skopiuj token i wyślij mi komendę:\n   /connect [twój-token]\n\nPo połączeniu będziesz otrzymywać inteligentne powiadomienia! 🚀`);
      return;
    }
    
    // Handle other messages from connected users
    const isConnected = await checkUserConnection(chatId);
    if (isConnected) {
      await updateLastMessageTime(chatId);
      await bot.sendMessage(chatId, '💬 Otrzymałem Twoją wiadomość! Obecnie bot obsługuje głównie proaktywne powiadomienia. Pełne rozmowy będą dostępne wkrótce.');
    } else {
      await bot.sendMessage(chatId, `🆔 Twój Chat ID: ${chatId}\n\n❌ Twój Telegram nie jest połączony z aplikacją. Wyślij /start aby otrzymać instrukcje.`);
    }
    
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(chatId, '❌ Wystąpił błąd. Spróbuj ponownie.');
  }
});

// Handle /connect command
async function handleConnectCommand(chatId, connectionToken, username) {
  try {
    // Find telegram connection by token
    const result = await dbClient.query(
      'SELECT tc.*, u.email FROM telegram_connections tc JOIN users u ON tc."userId" = u.id WHERE tc."connectionToken" = $1',
      [connectionToken]
    );
    
    if (result.rows.length === 0) {
      await bot.sendMessage(chatId, '❌ Token nieprawidłowy lub wygasł. Wygeneruj nowy token w aplikacji.');
      return;
    }
    
    const connection = result.rows[0];
    
    // Update connection with chat ID and activate
    await dbClient.query(
      'UPDATE telegram_connections SET "telegramChatId" = $1, "telegramUsername" = $2, "isActive" = true, "connectedAt" = NOW(), "lastMessageAt" = NOW() WHERE id = $3',
      [chatId, username, connection.id]
    );
    
    // Also update user record
    await dbClient.query(
      'UPDATE users SET "telegramChatId" = $1, "telegramUsername" = $2 WHERE id = $3',
      [chatId, username, connection.userId]
    );
    
    await bot.sendMessage(chatId, `✅ Połączenie udane!\n\nTwój Telegram jest teraz połączony z PROCODE AI.\n\n🤖 Będziesz otrzymywać proaktywne wiadomości na podstawie Twojego kontekstu życiowego.\n\n💡 Aby uzyskać maksymalne korzyści, uzupełnij swój kontekst w aplikacji: Mój Kontekst.\n\nWitaj w systemie inteligentnych powiadomień! 🚀`);
    
    console.log(`✅ User ${connection.email} connected with chat ID ${chatId}`);
    
  } catch (error) {
    console.error('Error in connect command:', error);
    await bot.sendMessage(chatId, '❌ Wystąpił błąd podczas łączenia. Spróbuj ponownie.');
  }
}

// Check if user is connected
async function checkUserConnection(chatId) {
  try {
    const result = await dbClient.query(
      'SELECT id FROM telegram_connections WHERE "telegramChatId" = $1 AND "isActive" = true',
      [chatId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
}

// Update last message time
async function updateLastMessageTime(chatId) {
  try {
    await dbClient.query(
      'UPDATE telegram_connections SET "lastMessageAt" = NOW() WHERE "telegramChatId" = $1',
      [chatId]
    );
  } catch (error) {
    console.error('Error updating last message time:', error);
  }
}

// Send pending proactive messages
async function processPendingMessages() {
  try {
    const result = await dbClient.query(`
      SELECT pm.id, pm.content, tc."telegramChatId"
      FROM proactive_messages pm
      JOIN users u ON pm."userId" = u.id
      JOIN telegram_connections tc ON u.id = tc."userId"
      WHERE pm.status = 'pending' 
      AND tc."isActive" = true
      AND (pm."scheduledFor" IS NULL OR pm."scheduledFor" <= NOW())
      ORDER BY pm."createdAt" ASC
      LIMIT 10
    `);
    
    for (const message of result.rows) {
      try {
        await bot.sendMessage(message.telegramChatId, message.content);
        
        // Update message status
        await dbClient.query(
          'UPDATE proactive_messages SET status = $1, "sentAt" = NOW() WHERE id = $2',
          ['sent', message.id]
        );
        
        console.log(`📤 Sent proactive message ${message.id} to ${message.telegramChatId}`);
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error sending message ${message.id}:`, error);
        
        // Mark as failed
        await dbClient.query(
          'UPDATE proactive_messages SET status = $1 WHERE id = $2',
          ['failed', message.id]
        );
      }
    }
  } catch (error) {
    console.error('Error processing pending messages:', error);
  }
}

// Error handlers
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Telegram bot...');
  await bot.stopPolling();
  await dbClient.end();
  process.exit(0);
});

// Start the microservice
async function start() {
  await initDatabase();
  
  // Process pending messages every 30 seconds
  setInterval(processPendingMessages, 30000);
  
  console.log('🚀 Telegram Bot Microservice is running!');
  console.log('📡 Polling for messages...');
  console.log('⏰ Processing pending messages every 30 seconds...');
}

start().catch(console.error);