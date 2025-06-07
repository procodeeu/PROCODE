import { prisma } from '~/lib/prisma'

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      username?: string
      language_code?: string
    }
    chat: {
      id: number
      first_name: string
      username?: string
      type: string
    }
    date: number
    text?: string
  }
}

export default defineEventHandler(async (event) => {
  
  // Verify webhook is from Telegram (you should implement proper verification)
  // For now, we'll just process the webhook
  
  try {
    const body = await readBody(event) as TelegramUpdate
    
    if (!body.message || !body.message.text) {
      return { status: 'ok' }
    }
    
    const message = body.message
    const chatId = message.chat.id.toString()
    const text = message.text?.trim() || ''
    
    // Handle /connect command
    if (text.startsWith('/connect ')) {
      const token = text.replace('/connect ', '').trim()
      
      try {
        // Find telegram connection by token
        const telegramConnection = await prisma.telegramConnection.findUnique({
          where: { connectionToken: token },
          include: { user: true }
        })
        
        if (!telegramConnection) {
          await sendTelegramMessage(chatId, '❌ Token nieprawidłowy lub wygasł. Wygeneruj nowy token w aplikacji.')
          return { status: 'ok' }
        }
        
        // Update connection with chat ID and activate
        await prisma.telegramConnection.update({
          where: { id: telegramConnection.id },
          data: {
            telegramChatId: chatId,
            telegramUsername: message.from.username,
            isActive: true,
            connectedAt: new Date(),
            lastMessageAt: new Date()
          }
        })
        
        // Also update user record
        await prisma.user.update({
          where: { id: telegramConnection.userId },
          data: {
            telegramChatId: chatId,
            telegramUsername: message.from.username
          }
        })
        
        await sendTelegramMessage(chatId, `✅ Połączenie udane! 

Twój Telegram jest teraz połączony z PROCODE AI. 

🤖 Będziesz otrzymywać proaktywne wiadomości na podstawie Twojego kontekstu życiowego.

💡 Aby uzyskać maksymalne korzyści, uzupełnij swój kontekst w aplikacji: Mój Kontekst.

Witaj w systemie inteligentnych powiadomień! 🚀`)
        
        return { status: 'ok', connected: true }
        
      } catch (error) {
        console.error('Error processing /connect command:', error)
        await sendTelegramMessage(chatId, '❌ Wystąpił błąd podczas łączenia. Spróbuj ponownie.')
        return { status: 'error' }
      }
    }
    
    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(chatId, `🤖 Witaj w PROCODE AI Bot!

Aby połączyć swój Telegram z aplikacją:

1️⃣ Zaloguj się do aplikacji PROCODE
2️⃣ Przejdź do Dashboard 
3️⃣ Kliknij "Połącz z Telegram"
4️⃣ Skopiuj token i wyślij mi komendę:
   /connect [twój-token]

Po połączeniu będziesz otrzymywać inteligentne powiadomienia dostosowane do Twojego kontekstu życiowego! 🚀`)
      return { status: 'ok' }
    }
    
    // Handle other messages from connected users
    const telegramConnection = await prisma.telegramConnection.findUnique({
      where: { telegramChatId: chatId },
      include: { user: true }
    })
    
    if (telegramConnection && telegramConnection.isActive) {
      // Update last message time
      await prisma.telegramConnection.update({
        where: { id: telegramConnection.id },
        data: { lastMessageAt: new Date() }
      })
      
      // Handle conversation - could be implemented later
      await sendTelegramMessage(chatId, '💬 Otrzymałem Twoją wiadomość! Obecnie bot obsługuje głównie proaktywne powiadomienia. Pełne rozmowy będą dostępne wkrótce.')
    } else {
      await sendTelegramMessage(chatId, '❌ Twój Telegram nie jest połączony z aplikacją. Wyślij /start aby otrzymać instrukcje.')
    }
    
    return { status: 'ok' }
    
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return { status: 'error', error: (error as Error).message }
  }
})

async function sendTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  if (!botToken) {
    console.error('Telegram bot token not configured')
    return false
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return false
  }
}