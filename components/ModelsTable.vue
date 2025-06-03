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

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 items-center">
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
        
        <div class="flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Szukaj modeli..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  title="Zaznacz/odznacz wszystkie"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontekst
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cena (Prompt/Completion)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="model in paginatedModels" :key="model.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="preferredModels.includes(model.id)"
                  @change="toggleModelPreference(model.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :title="`${preferredModels.includes(model.id) ? 'Usuń z' : 'Dodaj do'} ulubionych`"
                />
              </td>
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900 flex items-center">
                    {{ model.name }}
                    <span v-if="preferredModels.includes(model.id)" class="ml-2 text-yellow-500" title="Ulubiony model">
                      ⭐
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 max-w-xs truncate">
                    {{ model.description || 'Brak opisu' }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatContextLength(model.context_length) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="model.isFree" class="text-green-600 font-medium">
                  DARMOWY
                </div>
                <div v-else class="text-gray-900">
                  <div>${{ formatPrice(model.pricing.prompt) }} / ${{ formatPrice(model.pricing.completion) }}</div>
                  <div class="text-xs text-gray-500">za 1M tokenów</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ model.top_provider?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="model.isFree" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Darmowy
                </span>
                <span v-else class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Płatny
                </span>
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
  description: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
  }
  top_provider: {
    name?: string
  }
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
const currentPage = ref(1)
const itemsPerPage = 20

const totalModels = computed(() => models.value.length)
const freeModels = computed(() => models.value.filter(m => m.isFree).length)

const filteredModels = computed(() => {
  let filtered = models.value

  if (showOnlyFree.value) {
    filtered = filtered.filter(model => model.isFree)
  }

  if (showOnlyPreferred.value) {
    filtered = filtered.filter(model => preferredModels.value.includes(model.id))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query)
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

const formatPrice = (price: string): string => {
  const num = parseFloat(price)
  if (num === 0) return '0'
  if (num < 0.01) return num.toFixed(6)
  return num.toFixed(2)
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

// Reset pagination when filters change
watch([showOnlyFree, showOnlyPreferred, searchQuery], () => {
  currentPage.value = 1
})

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