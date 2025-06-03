import jwt from 'jsonwebtoken'
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
    
    // Get user's preferred models
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

    return {
      preferredModels: user.preferredModels || []
    }
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authentication token'
    })
  }
})