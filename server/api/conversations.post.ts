import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { title, firstMessage } = await readBody(event)
  
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
    
    // Create new conversation with first message
    const conversation = await prisma.conversation.create({
      data: {
        userId: decoded.userId,
        title: title || null,
        messages: firstMessage ? {
          create: {
            role: 'user',
            content: firstMessage,
            source: 'web'
          }
        } : undefined
      },
      include: {
        messages: true
      }
    })

    return {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        isActive: conversation.isActive,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt.toISOString()
        }))
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