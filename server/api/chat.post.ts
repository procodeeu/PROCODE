import jwt from 'jsonwebtoken'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const startTime = Date.now()
  
  if (!body.message || typeof body.message !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required and must be a string'
    })
  }

  console.log('Runtime config check:', {
    hasOpenrouterKey: !!config.openrouterApiKey,
    keyLength: config.openrouterApiKey?.length || 0,
    keyPrefix: config.openrouterApiKey?.substring(0, 10) || 'undefined'
  })

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
    // Prepare request data
    const requestData = {
      model: modelToUse,
      messages: [
        { role: 'user', content: body.message }
      ],
      max_tokens: 500,
      temperature: 0.7
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ProCode Chat App'
      },
      body: JSON.stringify(requestData)
    })

    const latency = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        model: modelToUse,
        hasApiKey: !!config.openrouterApiKey
      })
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    const aiMessage = data.choices && data.choices.length > 0
      ? data.choices[0].message.content
      : 'Brak odpowiedzi z AI'

    // Get model metadata from our models cache/API
    let modelData = null
    try {
      const modelsResponse = await fetch(`${config.public.apiBase || '/api'}/models`, {
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`
        }
      })
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        modelData = modelsData.models?.find((m: any) => m.id === modelToUse) || null
      }
    } catch (err) {
      console.warn('Could not fetch model metadata:', err)
    }

    return {
      message: aiMessage,
      model: modelToUse,
      responseMetadata: {
        requestData,
        responseData: data,
        modelData,
        latency,
        tokensUsed: data.usage || null,
        status: 'success'
      }
    }
  } catch (error: any) {
    const latency = Date.now() - startTime
    
    return {
      message: 'Przepraszam, wystąpił błąd podczas generowania odpowiedzi.',
      model: modelToUse,
      responseMetadata: {
        requestData: {
          model: modelToUse,
          messages: [{ role: 'user', content: body.message }],
          max_tokens: 500,
          temperature: 0.7
        },
        responseData: null,
        modelData: null,
        latency,
        tokensUsed: null,
        status: 'error',
        errorDetails: {
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  }
})