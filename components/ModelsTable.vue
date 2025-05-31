<template>
  <div class="models-table-container">
    <!-- Header with filters -->
    <div class="mb-6 bg-white p-6 rounded-lg shadow">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Dostępne modele AI</h2>
          <p class="text-gray-600">
            Łącznie {{ totalModels }} modeli, w tym {{ freeModels }} darmowych
          </p>
        </div>
        <button
          @click="refreshModels"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Ładowanie...' : 'Odśwież' }}
        </button>
      </div>

      <!-- Basic Filters -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center mb-4">
        <label class="flex items-center">
          <input
            v-model="showOnlyFree"
            type="checkbox"
            class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm font-medium text-gray-700">Tylko darmowe modele</span>
        </label>
        
        <label class="flex items-center">
          <input
            v-model="showOnlyPreferred"
            type="checkbox"
            class="mr-2 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
          />
          <span class="text-sm font-medium text-gray-700 flex items-center">
            ⭐ Tylko ulubione modele
            <span class="ml-1 text-xs text-gray-500">({{ preferredModels.length }})</span>
          </span>
        </label>
        
        <select v-model="selectedProvider" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Wszyscy providerzy</option>
          <option v-for="provider in uniqueProviders" :key="provider" :value="provider">
            {{ provider }}
          </option>
        </select>
        
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Szukaj modeli..."
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tag Filters -->
      <div class="border-t border-gray-200 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-700">
            🏷️ Filtruj po tagach 
            <span v-if="selectedTags.length > 0" class="text-blue-600">({{ selectedTags.length }} wybranych)</span>
          </h3>
          <button 
            v-if="selectedTags.length > 0"
            @click="clearAllTags"
            class="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Wyczyść wszystkie
          </button>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in availableTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
              selectedTags.includes(tag)
                ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
            ]"
            :title="tagDefinitions[tag as keyof typeof tagDefinitions] || `Tag: ${tag}`"
          >
            {{ tag }}
            <span class="ml-1 text-xs opacity-75">({{ tagCounts[tag] }})</span>
          </button>
        </div>
        
        <!-- Selected Tags Summary -->
        <div v-if="selectedTags.length > 0" class="mt-3 p-3 bg-blue-50 rounded-lg">
          <div class="text-xs font-medium text-blue-700 mb-2">Aktywne filtry tagów:</div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in selectedTags" 
              :key="tag"
              class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded"
            >
              {{ tag }}
              <button 
                @click="toggleTag(tag)"
                class="ml-1 text-blue-600 hover:text-blue-800"
                :title="`Usuń filtr: ${tag}`"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Ładowanie modeli...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-red-800">Błąd ładowania modeli</h3>
      <p class="text-red-600 mt-2">{{ error }}</p>
    </div>

    <!-- Models table -->
    <div v-else-if="filteredModels.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200" style="min-width: 1200px;">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                ⭐
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID / Nazwa
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontekst
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Output
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cena (In/Out)
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modality
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="model in paginatedModels" :key="model.id" class="hover:bg-gray-50" :class="{ 'bg-yellow-50': preferredModels.includes(model.id) }">
              <!-- Favorite -->
              <td class="px-3 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  :checked="preferredModels.includes(model.id)"
                  @change="toggleModelPreference(model.id)"
                  class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  :title="`${preferredModels.includes(model.id) ? 'Usuń z' : 'Dodaj do'} ulubionych`"
                />
              </td>
              
              <!-- ID / Name -->
              <td class="px-3 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900 flex items-center">
                    {{ model.display_name }}
                    <span v-if="model.deprecated" class="ml-2 text-red-500" title="Model przestarzały">
                      ⚠️
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 font-mono">{{ model.id }}</div>
                  <div v-if="model.description" class="text-xs text-gray-600 max-w-xs truncate mt-1">
                    {{ model.description }}
                  </div>
                </div>
              </td>
              
              <!-- Provider -->
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                  {{ model.provider }}
                </span>
              </td>
              
              <!-- Context Length -->
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatContextLength(model.context_length) }}
              </td>
              
              <!-- Max Output -->
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ model.max_output_tokens ? formatContextLength(model.max_output_tokens) : 'N/A' }}
              </td>
              
              <!-- Pricing -->
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <div v-if="model.isFree" class="text-green-600 font-medium">
                  🆓 DARMOWY
                </div>
                <div v-else class="text-gray-900">
                  <div class="text-xs">
                    <div>In: ${{ formatPrice(model.input_cost_per_token, true) }}</div>
                    <div>Out: ${{ formatPrice(model.output_cost_per_token, true) }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Modality -->
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded" 
                      :class="model.modality === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                  {{ model.modality || 'text' }}
                </span>
              </td>
              
              <!-- Tags -->
              <td class="px-3 py-4">
                <div class="flex flex-wrap gap-1" v-if="model.tags?.length">
                  <span v-for="tag in model.tags.slice(0, 3)" :key="tag" 
                        class="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                    {{ tag }}
                  </span>
                  <span v-if="model.tags.length > 3" class="text-xs text-gray-500">
                    +{{ model.tags.length - 3 }}
                  </span>
                </div>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
              
              <!-- Status -->
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <span v-if="model.isFree" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Darmowy
                  </span>
                  <span v-else class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Płatny
                  </span>
                  <span v-if="model.deprecated" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Przestarzały
                  </span>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <button
                  @click="setAsCurrentModel(model.id)"
                  :disabled="isLoading"
                  class="px-3 py-1 text-xs font-medium rounded border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  :title="`Ustaw ${model.display_name} jako aktywny model`"
                >
                  Ustaw jako aktywny
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Wyświetlanie {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredModels.length) }} z {{ filteredModels.length }} modeli
          </div>
          <div class="flex space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Poprzednia
            </button>
            <span class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Następna
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <p class="text-gray-500">Nie znaleziono modeli pasujących do kryteriów wyszukiwania.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Model {
  id: string
  name: string
  display_name: string
  provider: string
  description: string
  context_length: number
  max_output_tokens: number | null
  input_cost_per_token: number
  output_cost_per_token: number
  pricing: {
    prompt: string
    completion: string
  }
  top_provider: {
    name?: string
  }
  tags: string[]
  tokenizer: string | null
  modality: string
  deprecated: boolean
  rate_limit: any
  isFree: boolean
}

interface ModelsResponse {
  models: Model[]
  totalCount: number
  freeCount: number
}

const models = ref<Model[]>([])
const preferredModels = ref<string[]>([])
const isLoading = ref(true)
const error = ref('')
const showOnlyFree = ref(true)
const showOnlyPreferred = ref(false)
const searchQuery = ref('')
const selectedProvider = ref('')
const selectedTags = ref<string[]>([])
const currentPage = ref(1)
const itemsPerPage = 20

// Tag definitions with descriptions
const tagDefinitions = {
  'cheap': 'Model o niskim koszcie za token; korzystny cenowo',
  'fast': 'Model o krótkim czasie odpowiedzi; szybki w generowaniu wyników',
  'chat': 'Przystosowany do dialogu; zoptymalizowany pod kątem konwersacji',
  'open-source': 'Model typu open-source; dostępny publicznie i bezpłatnie',
  'gpt-4-compatible': 'Model o podobnych możliwościach jak GPT-4; może być używany zamiennie',
  'vision': 'Obsługuje obraz jako input; umożliwia przetwarzanie danych wizualnych',
  'tool-use': 'Wspiera użycie narzędzi (np. funkcje/tool calls); umożliwia integrację z zewnętrznymi narzędziami',
  'function-calling': 'Obsługuje wywoływanie funkcji; pozwala na dynamiczne wykonywanie kodu',
  'multimodal': 'Obsługuje wiele modalności (np. tekst i obraz); umożliwia przetwarzanie różnych typów danych',
  'long-context': 'Obsługuje długi kontekst; przydatny przy analizie obszernych dokumentów',
  'beta': 'Model w wersji beta; może być niestabilny lub w fazie testów',
  'instruction-tuned': 'Model dostrojony do wykonywania instrukcji; lepiej rozumie polecenia użytkownika'
}

const totalModels = computed(() => models.value.length)
const freeModels = computed(() => models.value.filter(m => m.isFree).length)

const uniqueProviders = computed(() => {
  const providers = [...new Set(models.value.map(m => m.provider))]
  return providers.sort()
})

const availableTags = computed(() => {
  const allTags = models.value.flatMap(m => m.tags || [])
  const uniqueTags = [...new Set(allTags)]
  return uniqueTags.sort()
})

const tagCounts = computed(() => {
  const counts: Record<string, number> = {}
  availableTags.value.forEach(tag => {
    counts[tag] = models.value.filter(m => m.tags?.includes(tag)).length
  })
  return counts
})

const filteredModels = computed(() => {
  let filtered = models.value

  if (showOnlyFree.value) {
    filtered = filtered.filter(model => model.isFree)
  }

  if (showOnlyPreferred.value) {
    filtered = filtered.filter(model => preferredModels.value.includes(model.id))
  }

  if (selectedProvider.value) {
    filtered = filtered.filter(model => model.provider === selectedProvider.value)
  }

  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(model => 
      selectedTags.value.every(tag => model.tags?.includes(tag))
    )
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.display_name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query) ||
      model.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredModels.value.length / itemsPerPage))

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredModels.value.slice(start, end)
})

const formatContextLength = (length: number): string => {
  if (length >= 1000000) {
    return `${(length / 1000000).toFixed(1)}M`
  } else if (length >= 1000) {
    return `${(length / 1000).toFixed(0)}k`
  }
  return length.toString()
}

const formatPrice = (price: string | number, isPerToken = false): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (num === 0) return '0'
  
  if (isPerToken) {
    // For per-token pricing, show in scientific notation or very small decimals
    if (num < 0.000001) return num.toExponential(2)
    if (num < 0.01) return num.toFixed(6)
    return num.toFixed(4)
  }
  
  if (num < 0.01) return num.toFixed(6)
  return num.toFixed(2)
}

const setAsCurrentModel = async (modelId: string) => {
  try {
    isLoading.value = true
    
    await $fetch('/api/user/current-model', {
      method: 'POST',
      body: { modelId }
    })
    
    // Refresh data
    await fetchModels()
    
    // Show success message
    error.value = ''
    // You could add a success toast here
    
  } catch (err: any) {
    error.value = `Błąd podczas ustawiania modelu: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

const fetchModels = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const [modelsResponse, preferencesResponse] = await Promise.all([
      $fetch<ModelsResponse>('/api/models'),
      $fetch<{preferredModels: string[]}>('/api/user/preferred-models').catch(() => ({ preferredModels: [] }))
    ])
    
    models.value = modelsResponse.models
    preferredModels.value = preferencesResponse.preferredModels
  } catch (err: any) {
    error.value = err.message || 'Błąd podczas ładowania modeli'
  } finally {
    isLoading.value = false
  }
}

const toggleModelPreference = async (modelId: string) => {
  try {
    const action = preferredModels.value.includes(modelId) ? 'remove' : 'add'
    
    const response = await $fetch<{preferredModels: string[]}>('/api/user/preferred-models', {
      method: 'POST',
      body: { modelId, action }
    })
    
    preferredModels.value = response.preferredModels
  } catch (err: any) {
    error.value = `Błąd podczas zapisywania preferencji: ${err.message}`
  }
}

const refreshModels = () => {
  currentPage.value = 1
  fetchModels()
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const clearAllTags = () => {
  selectedTags.value = []
}

// Reset pagination when filters change
watch([showOnlyFree, showOnlyPreferred, searchQuery, selectedProvider, selectedTags], () => {
  currentPage.value = 1
}, { deep: true })

// Load models on mount
onMounted(() => {
  fetchModels()
})
</script>

<style scoped>
.models-table-container {
  font-family: 'Inter', sans-serif;
}
</style>