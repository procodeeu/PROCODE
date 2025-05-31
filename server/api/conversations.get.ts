import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  
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
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    
    // Get user's conversations with message count and last message
    const conversations = await prisma.conversation.findMany({
      where: { 
        userId: decoded.userId 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Transform data for frontend
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      isActive: conv.isActive,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messageCount: conv._count.messages,
      lastMessage: conv.messages[0] ? {
        id: conv.messages[0].id,
        role: conv.messages[0].role,
        content: conv.messages[0].content,
        createdAt: conv.messages[0].createdAt.toISOString()
      } : undefined
    }))

    return {
      conversations: transformedConversations
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