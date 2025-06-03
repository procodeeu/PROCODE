import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  if (!body.message || typeof body.message !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required and must be a string'
    })
  }

  if (!config.openrouterApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenRouter API key not configured'
    })
  }

  // Get user's current model
  let modelToUse = 'mistralai/devstral-small:free' // default
  
  try {
    const token = getCookie(event, 'auth-token')
    if (token) {
      const decoded = jwt.verify(token, config.authSecret) as { userId: string }
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { currentModel: true }
      })
      
      if (user?.currentModel) {
        modelToUse = user.currentModel
      }
    }
  } catch (err) {
    // If auth fails, just use default model
    console.warn('Could not get user model, using default')
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'ProCode Chat App'
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'user', content: body.message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    const aiMessage = data.choices && data.choices.length > 0
      ? data.choices[0].message.content
      : 'Brak odpowiedzi z AI'

    return {
      message: aiMessage,
      model: modelToUse
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error communicating with OpenRouter: ${error.message}`
    })
  }
})