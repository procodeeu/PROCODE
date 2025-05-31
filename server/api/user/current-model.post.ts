import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const { modelId } = await readBody(event)
  
  if (!modelId || typeof modelId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'modelId is required and must be a string'
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
    
    // Get current user data
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

    // Add model to preferred models if not already there
    let updatedPreferredModels = [...(user.preferredModels || [])]
    if (!updatedPreferredModels.includes(modelId)) {
      updatedPreferredModels.push(modelId)
    }

    // Update user's current model and preferred models
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        currentModel: modelId,
        preferredModels: updatedPreferredModels
      },
      select: { 
        currentModel: true,
        preferredModels: true 
      }
    })

    return {
      success: true,
      currentModel: updatedUser.currentModel,
      preferredModels: updatedUser.preferredModels
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