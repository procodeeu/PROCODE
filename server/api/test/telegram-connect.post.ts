import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, telegramChatId } = body
  
  if (!token || !telegramChatId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token and telegramChatId required'
    })
  }
  
  try {
    // Find telegram connection by token
    const telegramConnection = await prisma.telegramConnection.findUnique({
      where: { connectionToken: token },
      include: { user: true }
    })
    
    if (!telegramConnection) {
      return { 
        success: false, 
        message: 'Token not found or expired' 
      }
    }
    
    // Update connection with chat ID and activate
    await prisma.telegramConnection.update({
      where: { id: telegramConnection.id },
      data: {
        telegramChatId: telegramChatId,
        telegramUsername: 'test_user',
        isActive: true,
        connectedAt: new Date(),
        lastMessageAt: new Date()
      }
    })
    
    // Also update user record
    await prisma.user.update({
      where: { id: telegramConnection.userId },
      data: {
        telegramChatId: telegramChatId,
        telegramUsername: 'test_user'
      }
    })
    
    return {
      success: true,
      message: 'Connection successful! Your Telegram is now connected to PROCODE AI.',
      user: telegramConnection.user.email
    }
    
  } catch (error) {
    console.error('Error in test connect:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})