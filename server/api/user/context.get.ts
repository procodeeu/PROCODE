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
    
    // Get user's context
    const userContext = await prisma.userContext.findUnique({
      where: { userId: decoded.userId },
      select: {
        personalBio: true,
        currentSituation: true,
        longTermGoals: true,
        shortTermGoals: true,
        challenges: true,
        workContext: true,
        skillsToLearn: true,
        dailyRoutine: true,
        interests: true,
        relationships: true,
        healthGoals: true,
        communicationStyle: true,
        proactiveTopics: true,
        notificationSettings: true,
        lastAnalyzed: true,
        analysisResults: true,
        updatedAt: true
      }
    })

    return {
      context: userContext
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