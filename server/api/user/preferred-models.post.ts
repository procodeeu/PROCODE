import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const { modelId, action } = await readBody(event)
  
  if (!modelId || !action || !['add', 'remove'].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request: modelId and action (add/remove) are required'
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
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    
    // Get current user with preferred models
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { preferredModels: true }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    let updatedModels = [...(user.preferredModels || [])]

    if (action === 'add') {
      // Add model if not already in the list
      if (!updatedModels.includes(modelId)) {
        updatedModels.push(modelId)
      }
    } else if (action === 'remove') {
      // Remove model from the list
      updatedModels = updatedModels.filter(id => id !== modelId)
    }

    // Update user's preferred models
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { preferredModels: updatedModels },
      select: { preferredModels: true }
    })

    return {
      success: true,
      preferredModels: updatedUser.preferredModels,
      action,
      modelId
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