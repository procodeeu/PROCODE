import { prisma } from '~/lib/prisma'

interface ContextAnalysisResult {
  shouldSendMessage: boolean
  messageType: 'suggestion' | 'reminder' | 'question' | 'update'
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  scheduledFor?: Date
  reasoning: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // This endpoint should be called by a cron job every hour
  // For security, you might want to add API key verification here
  
  try {
    console.log('🔍 Starting proactive context analysis...')
    
    // Get all users with active Telegram connections and recent context updates
    const usersToAnalyze = await prisma.user.findMany({
      where: {
        isActive: true,
        telegramConnection: {
          isActive: true
        },
        userContext: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Updated in last 30 days
          }
        }
      },
      include: {
        userContext: true,
        telegramConnection: true,
        proactiveMessages: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      }
    })
    
    console.log(`📊 Found ${usersToAnalyze.length} users to analyze`)
    
    const results = []
    
    for (const user of usersToAnalyze) {
      if (!user.userContext) continue
      
      try {
        // Skip if user received a message in the last 4 hours
        const recentMessage = user.proactiveMessages.find(msg => 
          new Date(msg.createdAt).getTime() > Date.now() - 4 * 60 * 60 * 1000
        )
        
        if (recentMessage) {
          console.log(`⏰ Skipping user ${user.email} - recent message sent`)
          continue
        }
        
        // Analyze user context and determine if we should send a proactive message
        const analysis = await analyzeUserContext(user.userContext, user)
        
        if (analysis.shouldSendMessage) {
          // Create proactive message record
          const proactiveMessage = await prisma.proactiveMessage.create({
            data: {
              userId: user.id,
              type: analysis.messageType,
              title: analysis.title,
              content: analysis.content,
              status: 'pending',
              scheduledFor: analysis.scheduledFor || new Date(),
              metadata: {
                reasoning: analysis.reasoning,
                priority: analysis.priority,
                analysisTimestamp: new Date().toISOString()
              }
            }
          })
          
          // Send immediately if scheduled for now
          if (!analysis.scheduledFor || analysis.scheduledFor <= new Date()) {
            await sendProactiveMessage(proactiveMessage.id)
          }
          
          results.push({
            userId: user.id,
            email: user.email,
            messageId: proactiveMessage.id,
            type: analysis.messageType,
            scheduled: analysis.scheduledFor
          })
        }
        
      } catch (error) {
        console.error(`Error analyzing user ${user.email}:`, error)
      }
    }
    
    return {
      success: true,
      analyzed: usersToAnalyze.length,
      messagesCreated: results.length,
      results
    }
    
  } catch (error) {
    console.error('Context analysis error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Analysis failed'
    })
  }
})

async function analyzeUserContext(userContext: any, user: any): Promise<ContextAnalysisResult> {
  const now = new Date()
  const currentHour = now.getHours()
  
  // Simple rule-based analysis (could be replaced with AI analysis later)
  
  // Morning motivation (8-10 AM)
  if (currentHour >= 8 && currentHour <= 10) {
    if (userContext.shortTermGoals && Array.isArray(userContext.shortTermGoals) && userContext.shortTermGoals.length > 0) {
      const randomGoal = userContext.shortTermGoals[Math.floor(Math.random() * userContext.shortTermGoals.length)]
      return {
        shouldSendMessage: true,
        messageType: 'suggestion',
        title: '🌅 Poranek to idealna pora na realizację celów',
        content: `Dzień dobry! 🌞

Dziś może być dobry dzień na zrobienie kroku w kierunku jednego z Twoich celów:

🎯 "${randomGoal}"

Co możesz zrobić dziś, żeby się do tego zbliżyć? Nawet 15 minut może zrobić różnicę! 💪`,
        priority: 'medium',
        reasoning: 'Morning motivation based on short-term goals'
      }
    }
  }
  
  // Evening reflection (18-20)
  if (currentHour >= 18 && currentHour <= 20) {
    if (userContext.challenges && Array.isArray(userContext.challenges) && userContext.challenges.length > 0) {
      const randomChallenge = userContext.challenges[Math.floor(Math.random() * userContext.challenges.length)]
      return {
        shouldSendMessage: true,
        messageType: 'question',
        title: '🤔 Czas na refleksję nad wyzwaniami',
        content: `Dobry wieczór! 🌆

Jak sobie radzisz z tym wyzwaniem:

⚡ "${randomChallenge}"

Czy zrobiłeś dziś jakiś postęp? A może odkryłeś coś nowego o tym problemie? 

Czasem warto się zatrzymać i zastanowić nad różnymi podejściami 💭`,
        priority: 'low',
        reasoning: 'Evening reflection on challenges'
      }
    }
  }
  
  // Skills learning reminder (weekdays, random times)
  if (now.getDay() >= 1 && now.getDay() <= 5) { // Monday to Friday
    if (userContext.skillsToLearn && Array.isArray(userContext.skillsToLearn) && userContext.skillsToLearn.length > 0) {
      const randomSkill = userContext.skillsToLearn[Math.floor(Math.random() * userContext.skillsToLearn.length)]
      
      // 30% chance to send learning reminder
      if (Math.random() < 0.3) {
        return {
          shouldSendMessage: true,
          messageType: 'reminder',
          title: '📚 Przypomnienie o nauce',
          content: `Cześć! 👋

Pamiętasz o swoim planie nauki:

🎓 "${randomSkill}"

Może dziś znajdziesz 20-30 minut na naukę? Konsekwentna, regularna praca przynosi najlepsze rezultaty! 

🔥 Każdy dzień to krok naprzód!`,
          priority: 'medium',
          reasoning: 'Skills learning reminder for weekday'
        }
      }
    }
  }
  
  // Health goals check (random times)
  if (userContext.healthGoals && Array.isArray(userContext.healthGoals) && userContext.healthGoals.length > 0) {
    const randomHealthGoal = userContext.healthGoals[Math.floor(Math.random() * userContext.healthGoals.length)]
    
    // 20% chance to send health reminder
    if (Math.random() < 0.2) {
      return {
        shouldSendMessage: true,
        messageType: 'reminder',
        title: '💪 Twoje zdrowie ma znaczenie',
        content: `Hej! 🌟

Jak tam Twój cel zdrowotny:

🏃‍♂️ "${randomHealthGoal}"

Pamiętaj, że małe kroki każdego dnia prowadzą do wielkich zmian. Dbaj o siebie! ❤️`,
        priority: 'high',
        reasoning: 'Health goals reminder'
      }
    }
  }
  
  // Default: no message
  return {
    shouldSendMessage: false,
    messageType: 'suggestion',
    title: '',
    content: '',
    priority: 'low',
    reasoning: 'No relevant triggers found'
  }
}

async function sendProactiveMessage(messageId: string) {
  try {
    const message = await prisma.proactiveMessage.findUnique({
      where: { id: messageId },
      include: { 
        user: { 
          include: { telegramConnection: true } 
        } 
      }
    })
    
    if (!message || !message.user.telegramConnection?.isActive) {
      return false
    }
    
    const chatId = message.user.telegramConnection.telegramChatId
    const success = await sendTelegramMessage(chatId, message.content)
    
    if (success) {
      await prisma.proactiveMessage.update({
        where: { id: messageId },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      })
    }
    
    return success
  } catch (error) {
    console.error('Error sending proactive message:', error)
    return false
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken
  
  if (!botToken) {
    console.error('Telegram bot token not configured')
    return false
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return false
  }
}