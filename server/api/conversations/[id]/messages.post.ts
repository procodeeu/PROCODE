import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const conversationId = getRouterParam(event, 'id')
  const { role, content, metadata, responseMetadata } = await readBody(event)
  
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID is required'
    })
  }

  if (!role || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role and content are required'
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
    
    // Verify user owns this conversation
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: decoded.userId 
      }
    })

    if (!conversation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Conversation not found'
      })
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        metadata: metadata || null,
        source: 'web'
      }
    })

    // If this is an AI response with metadata, create AIResponse record
    if (role === 'assistant' && responseMetadata) {
      await prisma.aIResponse.create({
        data: {
          messageId: message.id,
          modelId: responseMetadata.requestData?.model || 'unknown',
          modelData: responseMetadata.modelData || {},
          requestData: responseMetadata.requestData || {},
          responseData: responseMetadata.responseData || {},
          tokensUsed: responseMetadata.tokensUsed || null,
          latency: responseMetadata.latency || null,
          status: responseMetadata.status || 'success',
          errorDetails: responseMetadata.errorDetails || null
        }
      })
    }

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return {
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        metadata: message.metadata
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