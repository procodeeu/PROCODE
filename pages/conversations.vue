<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">💬 Archiwum rozmów</h1>
            <p class="text-gray-600">Historia wszystkich konwersacji z AI</p>
          </div>
          <button @click="$router.back()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            ← Powrót
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Ładowanie konwersacji...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-red-800">Błąd ładowania konwersacji</h3>
        <p class="text-red-600 mt-2">{{ error }}</p>
      </div>

      <!-- Conversations list -->
      <div v-else-if="conversations.length > 0" class="space-y-4">
        <div 
          v-for="conversation in conversations" 
          :key="conversation.id"
          class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="openConversation(conversation.id)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ conversation.title || 'Nowa rozmowa' }}
              </h3>
              <p class="text-sm text-gray-600 mb-3">
                {{ formatDate(conversation.createdAt) }}
              </p>
              
              <!-- Last message preview -->
              <div v-if="conversation.lastMessage" class="bg-gray-50 rounded-lg p-3">
                <div class="flex items-center mb-2">
                  <span class="text-xs font-medium text-gray-500 uppercase">
                    {{ conversation.lastMessage.role === 'user' ? '👤 Ty' : '🤖 AI' }}
                  </span>
                  <span class="text-xs text-gray-400 ml-2">
                    {{ formatTime(conversation.lastMessage.createdAt) }}
                  </span>
                </div>
                <p class="text-sm text-gray-700 line-clamp-2">
                  {{ conversation.lastMessage.content }}
                </p>
              </div>
            </div>
            
            <div class="flex flex-col items-end ml-4">
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" 
                    :class="conversation.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                {{ conversation.isActive ? 'Aktywna' : 'Zakończona' }}
              </span>
              <span class="text-xs text-gray-500 mt-2">
                {{ conversation.messageCount }} {{ conversation.messageCount === 1 ? 'wiadomość' : 'wiadomości' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <div class="max-w-md mx-auto">
          <div class="text-6xl mb-4">💭</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Brak konwersacji</h3>
          <p class="text-gray-600 mb-6">Rozpocznij pierwszą rozmowę z AI, aby zobaczyć ją tutaj.</p>
          <NuxtLink to="/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
            Rozpocznij rozmowę
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  id: string
  role: string
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: Message
}

const conversations = ref<Conversation[]>([])
const isLoading = ref(true)
const error = ref('')

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Dzisiaj'
  if (diffDays === 2) return 'Wczoraj'
  if (diffDays <= 7) return `${diffDays} dni temu`
  
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchConversations = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await $fetch<{ conversations: Conversation[] }>('/api/conversations')
    conversations.value = response.conversations
  } catch (err: any) {
    error.value = err.message || 'Błąd podczas ładowania konwersacji'
  } finally {
    isLoading.value = false
  }
}

const openConversation = (conversationId: string) => {
  // Navigate back to dashboard with conversation ID
  navigateTo(`/dashboard?conversation=${conversationId}`)
}

// Load conversations on mount
onMounted(() => {
  fetchConversations()
})

useSeoMeta({
  title: 'Archiwum rozmów - PROCODE',
  description: 'Historia konwersacji z AI'
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>