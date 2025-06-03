export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.openrouterApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenRouter API key not configured'
    })
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'ProCode Models Browser'
      }
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform the data to include useful information
    const models = data.data?.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description || '',
      context_length: model.context_length || 0,
      pricing: {
        prompt: model.pricing?.prompt || '0',
        completion: model.pricing?.completion || '0'
      },
      top_provider: model.top_provider || {},
      architecture: model.architecture || {},
      per_request_limits: model.per_request_limits || null,
      isFree: (parseFloat(model.pricing?.prompt || '0') === 0 && parseFloat(model.pricing?.completion || '0') === 0)
    })) || []

    return {
      models,
      totalCount: models.length,
      freeCount: models.filter((m: any) => m.isFree).length
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching models: ${error.message}`
    })
  }
})