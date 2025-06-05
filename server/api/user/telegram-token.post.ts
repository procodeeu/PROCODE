import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get auth token from cookies
  const token = getCookie(event, 'auth-token')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.authSecret) as { userId: string }
    
    // Generate unique connection token
    const connectionToken = crypto.randomBytes(32).toString('hex')
    
    // Delete any existing telegram connection for this user
    await prisma.telegramConnection.deleteMany({
      where: { userId: decoded.userId }
    })
    
    // Create new telegram connection record with token
    const telegramConnection = await prisma.telegramConnection.create({
      data: {
        userId: decoded.userId,
        telegramChatId: '', // Will be filled when user connects via bot
        connectionToken: connectionToken,
        isActive: false // Will be activated when bot receives the token
      }
    })

    return {
      success: true,
      token: connectionToken,
      instructions: {
        step1: 'Skopiuj poniższy token',
        step2: 'Otwórz Telegram i znajdź @procodeeu_bot',
        step3: 'Wyślij do bota komendę: /connect ' + connectionToken,
        step4: 'Bot potwierdzi połączenie i możesz zacząć otrzymywać proaktywne wiadomości',
        exampleCommand: `/connect ${connectionToken}`
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})