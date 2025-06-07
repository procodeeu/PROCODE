import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
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
    
    // Upsert user context (create or update)
    const userContext = await prisma.userContext.upsert({
      where: { userId: decoded.userId },
      create: {
        userId: decoded.userId,
        personalBio: body.personalBio,
        currentSituation: body.currentSituation,
        longTermGoals: body.longTermGoals,
        shortTermGoals: body.shortTermGoals,
        challenges: body.challenges,
        workContext: body.workContext,
        skillsToLearn: body.skillsToLearn,
        dailyRoutine: body.dailyRoutine,
        interests: body.interests,
        relationships: body.relationships,
        healthGoals: body.healthGoals,
        communicationStyle: body.communicationStyle,
        proactiveTopics: body.proactiveTopics,
        notificationSettings: body.notificationSettings || {
          enabled: true,
          frequency: 'daily',
          preferredTimes: ['09:00', '18:00']
        }
      },
      update: {
        personalBio: body.personalBio,
        currentSituation: body.currentSituation,
        longTermGoals: body.longTermGoals,
        shortTermGoals: body.shortTermGoals,
        challenges: body.challenges,
        workContext: body.workContext,
        skillsToLearn: body.skillsToLearn,
        dailyRoutine: body.dailyRoutine,
        interests: body.interests,
        relationships: body.relationships,
        healthGoals: body.healthGoals,
        communicationStyle: body.communicationStyle,
        proactiveTopics: body.proactiveTopics,
        notificationSettings: body.notificationSettings,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
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