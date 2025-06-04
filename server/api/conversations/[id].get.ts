import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const conversationId = getRouterParam(event, 'id')
  
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID is required'
    })
  }

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
    
    // Get conversation with all messages
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: decoded.userId 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            metadata: true,
            createdAt: true
          }
        }
      }
    })

    if (!conversation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Conversation not found'
      })
    }

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
          metadata: msg.metadata,
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