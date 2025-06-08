<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-white">PROCODE AI</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-300">{{ user?.email }}</span>
            <button 
              @click="handleLogout" 
              class="btn btn-secondary"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Chat Panel -->
        <div class="lg:col-span-2">
          <div class="card h-full">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-white">Chat AI</h2>
            </div>
            <div class="card-body flex flex-col h-96">
              <!-- Messages -->
              <div class="flex-1 overflow-y-auto mb-4 space-y-4" ref="messagesContainer">
                <div 
                  v-for="message in messages" 
                  :key="message.id"
                  :class="[
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div 
                    :class="[
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    ]"
                  >
                    <p class="text-sm">{{ message.content }}</p>
                    <span class="text-xs opacity-75">
                      {{ formatTime(message.created_at) }}
                    </span>
                  </div>
                </div>
                
                <!-- Loading indicator -->
                <div v-if="isTyping" class="flex justify-start">
                  <div class="bg-gray-700 text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Message Input -->
              <div class="flex space-x-2">
                <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  :disabled="isTyping"
                  class="form-input flex-1"
                  placeholder="Napisz wiadomość..."
                />
                <button 
                  @click="sendMessage"
                  :disabled="isTyping || !newMessage.trim()"
                  class="btn btn-primary disabled:opacity-50"
                >
                  Wyślij
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          
          <!-- Telegram Integration -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-white">Telegram Bot</h3>
            </div>
            <div class="card-body">
              <div v-if="telegramStatus.connected" class="text-green-400">
                <p class="font-medium">✅ Połączono</p>
                <p class="text-sm text-gray-400">@{{ telegramStatus.telegram_username }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Ostatnia wiadomość: {{ formatTime(telegramStatus.last_message_at) }}
                </p>
              </div>
              <div v-else>
                <p class="text-gray-400 mb-4">
                  Połącz swój Telegram aby otrzymywać proaktywne powiadomienia
                </p>
                <button 
                  @click="generateTelegramToken"
                  :disabled="generatingToken"
                  class="btn btn-primary w-full"
                >
                  {{ generatingToken ? 'Generowanie...' : 'Połącz z Telegram' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Telegram Token Modal -->
          <div v-if="showTokenModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold text-white mb-4">Połącz z Telegram</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-300 mb-2">1. Skopiuj token:</label>
                  <div class="flex">
                    <input 
                      :value="telegramToken" 
                      readonly 
                      class="form-input flex-1 font-mono text-sm"
                    />
                    <button 
                      @click="copyToken" 
                      class="btn btn-secondary ml-2"
                    >
                      Kopiuj
                    </button>
                  </div>
                </div>
                
                <div class="text-sm text-gray-300">
                  <p>2. Otwórz Telegram i znajdź: <strong>@procodeeu_bot</strong></p>
                  <p>3. Wyślij komendę: <code class="bg-gray-700 px-1 rounded">/connect {{ telegramToken }}</code></p>
                  <p>4. Bot potwierdzi połączenie</p>
                </div>
              </div>
              
              <div class="flex justify-end mt-6">
                <button @click="closeTokenModal" class="btn btn-secondary">
                  Zamknij
                </button>
              </div>
            </div>
          </div>

          <!-- User Context -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-white">Mój Kontekst</h3>
            </div>
            <div class="card-body">
              <textarea
                v-model="userContext"
                @blur="saveContext"
                class="form-textarea h-32"
                placeholder="Opisz swój kontekst życiowy, cele, preferencje..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-2">
                Automatycznie zapisywane
              </p>
            </div>
          </div>

          <!-- Model Selection -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-white">Model AI</h3>
            </div>
            <div class="card-body">
              <select 
                v-model="currentModel" 
                @change="updateModel"
                class="form-input w-full"
              >
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4">GPT-4</option>
                <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // Reactive data
    const user = ref(authStore.user)
    const messages = ref([])
    const newMessage = ref('')
    const isTyping = ref(false)
    const messagesContainer = ref(null)
    
    // Telegram
    const telegramStatus = ref({
      connected: false,
      telegram_username: null,
      last_message_at: null
    })
    const showTokenModal = ref(false)
    const telegramToken = ref('')
    const generatingToken = ref(false)
    
    // Context & Model
    const userContext = ref('')
    const currentModel = ref('anthropic/claude-3.5-sonnet')
    
    // Current conversation
    const currentConversationId = ref(null)

    // Methods
    const handleLogout = async () => {
      await authStore.logout()
      router.push('/')
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || isTyping.value) return

      const messageText = newMessage.value
      newMessage.value = ''
      
      // Add user message to UI immediately
      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString()
      }
      messages.value.push(userMsg)
      scrollToBottom()

      isTyping.value = true

      try {
        // Create conversation if needed
        if (!currentConversationId.value) {
          const convResponse = await api.post('/chat/conversations/create/', {
            title: 'New Conversation'
          })
          currentConversationId.value = convResponse.data.id
        }

        // Send message
        const response = await api.post(
          `/chat/conversations/${currentConversationId.value}/messages/`,
          { message: messageText }
        )

        if (response.data.assistantMessage) {
          messages.value.push(response.data.assistantMessage)
          scrollToBottom()
        }
      } catch (error) {
        console.error('Error sending message:', error)
        // Add error message
        messages.value.push({
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
          created_at: new Date().toISOString()
        })
      } finally {
        isTyping.value = false
        scrollToBottom()
      }
    }

    const generateTelegramToken = async () => {
      generatingToken.value = true
      try {
        const response = await api.post('/telegram/generate-token/')
        telegramToken.value = response.data.token
        showTokenModal.value = true
      } catch (error) {
        console.error('Error generating token:', error)
      } finally {
        generatingToken.value = false
      }
    }

    const copyToken = async () => {
      try {
        await navigator.clipboard.writeText(telegramToken.value)
        alert('Token skopiowany!')
      } catch (error) {
        console.error('Error copying token:', error)
      }
    }

    const closeTokenModal = () => {
      showTokenModal.value = false
      loadTelegramStatus() // Refresh status
    }

    const loadTelegramStatus = async () => {
      try {
        const response = await api.get('/telegram/status/')
        telegramStatus.value = response.data
      } catch (error) {
        console.error('Error loading telegram status:', error)
      }
    }

    const saveContext = async () => {
      try {
        await api.post('/auth/context/update/', { content: userContext.value })
      } catch (error) {
        console.error('Error saving context:', error)
      }
    }

    const loadContext = async () => {
      try {
        const response = await api.get('/auth/context/')
        userContext.value = response.data.content || ''
      } catch (error) {
        console.error('Error loading context:', error)
      }
    }

    const updateModel = async () => {
      try {
        await api.post('/auth/current-model/update/', { model: currentModel.value })
      } catch (error) {
        console.error('Error updating model:', error)
      }
    }

    const loadCurrentModel = async () => {
      try {
        const response = await api.get('/auth/current-model/')
        currentModel.value = response.data.currentModel
      } catch (error) {
        console.error('Error loading current model:', error)
      }
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadTelegramStatus()
      loadContext()
      loadCurrentModel()
    })

    return {
      user,
      messages,
      newMessage,
      isTyping,
      messagesContainer,
      telegramStatus,
      showTokenModal,
      telegramToken,
      generatingToken,
      userContext,
      currentModel,
      handleLogout,
      sendMessage,
      generateTelegramToken,
      copyToken,
      closeTokenModal,
      saveContext,
      updateModel,
      formatTime
    }
  }
}
</script>