<template>
  <div class="chat-panel p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Panel rozmowy AI</h2>
      <button 
        @click="startNewConversation"
        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium flex items-center gap-2"
      >
        ✨ Nowa rozmowa
      </button>
    </div>
    
    <!-- Model Selection -->
    <div class="model-selection mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Aktywny model AI:</label>
      <div class="flex items-center gap-4">
        <select 
          v-model="currentModel" 
          @change="changeModel"
          :disabled="isLoadingModels"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
        >
          <optgroup label="🆓 Darmowe modele">
            <option 
              v-for="model in freeModels" 
              :key="model.id" 
              :value="model.id"
              class="flex items-center"
            >
              {{ model.name }} {{ preferredModels.includes(model.id) ? '⭐' : '' }}
            </option>
          </optgroup>
          <optgroup label="💰 Płatne modele" v-if="paidModels.length > 0">
            <option 
              v-for="model in paidModels" 
              :key="model.id" 
              :value="model.id"
            >
              {{ model.name }} {{ preferredModels.includes(model.id) ? '⭐' : '' }}
            </option>
          </optgroup>
        </select>
        <span v-if="isLoadingModels" class="text-sm text-gray-500">Ładowanie...</span>
      </div>
    </div>

    <!-- Conversation History -->
    <div class="conversation-history mb-6 max-h-96 overflow-y-auto border border-gray-300 rounded-md bg-gray-50">
      <div v-if="messages.length === 0" class="p-4 text-center text-gray-500">
        Rozpocznij nową rozmowę...
      </div>
      <div v-else class="p-4 space-y-4">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div 
            class="max-w-xs lg:max-w-md xl:max-w-lg rounded-lg px-4 py-2"
            :class="message.role === 'user' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-900 border border-gray-200'"
          >
            <div class="flex items-center mb-1">
              <span class="text-xs font-medium opacity-75">
                {{ message.role === 'user' ? '👤 Ty' : '🤖 AI' }}
              </span>
              <span class="text-xs opacity-50 ml-2">
                {{ formatMessageTime(message.createdAt) }}
              </span>
            </div>
            <div class="text-sm whitespace-pre-wrap">{{ message.content }}</div>
          </div>
        </div>
        
        <!-- Loading message while AI responds -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
            <div class="flex items-center mb-1">
              <span class="text-xs font-medium opacity-75">🤖 AI</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area mb-4">
      <div class="flex gap-2 mb-2">
        <button 
          @click="startListening" 
          :disabled="isListening || isLoading" 
          class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
        >
          🎙️ {{ isListening ? 'Słucham...' : 'Nagraj' }}
        </button>
        
        <button 
          @click="stopListening" 
          :disabled="!isListening"
          class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
        >
          ⏹️ Stop
        </button>
        
      </div>
      
      <div class="flex gap-2">
        <textarea 
          v-model="currentTranscript" 
          @keydown.enter.prevent="sendMessage"
          class="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Wpisz wiadomość lub nagraj głosem..."
          rows="2"
        />
        <button 
          @click="sendMessage"
          :disabled="!currentTranscript.trim() || isLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isLoading ? '⏳' : '📤' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
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

const isListening = ref(false)
const isLoading = ref(false)
const finalTranscript = ref('')
const currentTranscript = ref('')
const error = ref('')
const availableModels = ref<Array<{id: string, name: string, isFree: boolean}>>([])
const currentModel = ref('mistralai/devstral-small:free')
const preferredModels = ref<string[]>([])
const isLoadingModels = ref(false)
const currentConversationId = ref<string | null>(null)
const messages = ref<Message[]>([])

let recognition: any = null

const freeModels = computed(() => availableModels.value.filter(m => m.isFree))
const paidModels = computed(() => availableModels.value.filter(m => !m.isFree))

const loadUserModelData = async () => {
  try {
    const response = await $fetch<{currentModel: string, preferredModels: string[]}>('/api/user/current-model')
    currentModel.value = response.currentModel
    preferredModels.value = response.preferredModels
  } catch (err: any) {
    console.error('Error loading user model data:', err)
  }
}

const loadAvailableModels = async () => {
  try {
    isLoadingModels.value = true
    const response = await $fetch<{models: Array<{id: string, name: string, isFree: boolean}>}>('/api/models')
    availableModels.value = response.models.map(m => ({
      id: m.id,
      name: m.name || m.id,
      isFree: m.isFree
    }))
  } catch (err: any) {
    console.error('Error loading models:', err)
  } finally {
    isLoadingModels.value = false
  }
}

const changeModel = async () => {
  try {
    await $fetch('/api/user/current-model', {
      method: 'POST',
      body: { modelId: currentModel.value }
    })
    
    // Refresh preferred models as the new model might be added
    await loadUserModelData()
  } catch (err: any) {
    error.value = `Błąd podczas zmiany modelu: ${err.message}`
  }
}

const loadConversation = async (conversationId: string) => {
  try {
    const response = await $fetch<{conversation: {id: string, messages: Message[]}}>(`/api/conversations/${conversationId}`)
    currentConversationId.value = response.conversation.id
    messages.value = response.conversation.messages
    scrollToBottom()
  } catch (err) {
    console.error('Error loading conversation:', err)
    startNewConversation()
  }
}

onMounted(() => {
  loadUserModelData()
  loadAvailableModels()
  
  // Check if we should load a specific conversation
  const route = useRoute()
  const conversationId = route.query.conversation as string
  if (conversationId) {
    loadConversation(conversationId)
  }
  
  if (typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      recognition = new SpeechRecognition()
      recognition.lang = 'pl-PL'
      recognition.interimResults = true
      recognition.continuous = false

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result:', event)
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i]
          transcript += res[0].transcript
          console.log('Transcript chunk:', res[0].transcript, 'isFinal:', res.isFinal)
          if (res.isFinal) {
            finalTranscript.value += res[0].transcript + ' '
          }
        }
        currentTranscript.value = finalTranscript.value + transcript
        console.log('Final transcript so far:', finalTranscript.value)
      }

      recognition.onstart = () => {
        finalTranscript.value = ''
        currentTranscript.value = ''
      }

      recognition.onend = () => {
        if (isListening.value) {
          recognition.start()
        }
      }

      recognition.onerror = (event: any) => {
        error.value = `Błąd rozpoznawania mowy: ${event.error}`
        isListening.value = false
      }
    } else {
      error.value = 'Przeglądarka nie wspiera rozpoznawania mowy'
    }
  }
})

const startListening = () => {
  if (!recognition) return
  
  error.value = ''
  finalTranscript.value = ''
  currentTranscript.value = ''
  isListening.value = true
  recognition.start()
}

const stopListening = () => {
  if (!recognition) return
  
  isListening.value = false
  recognition.stop()
}

const formatMessageTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.conversation-history')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const startNewConversation = () => {
  currentConversationId.value = null
  messages.value = []
  currentTranscript.value = ''
  finalTranscript.value = ''
  error.value = ''
  
  // Remove conversation parameter from URL if present
  const route = useRoute()
  if (route.query.conversation) {
    navigateTo('/dashboard', { replace: true })
  }
}

const sendMessage = async () => {
  const messageText = currentTranscript.value.trim() || finalTranscript.value.trim()
  if (!messageText) return
  
  isLoading.value = true
  error.value = ''
  
  // Add user message to UI immediately
  const tempUserMessage: Message = {
    id: 'temp-' + Date.now(),
    role: 'user',
    content: messageText,
    createdAt: new Date().toISOString()
  }
  messages.value.push(tempUserMessage)
  
  // Clear input
  currentTranscript.value = ''
  finalTranscript.value = ''
  
  scrollToBottom()
  
  try {
    // Create new conversation if needed
    if (!currentConversationId.value) {
      const conversationResponse = await $fetch<{conversation: {id: string, messages: Message[]}}>('/api/conversations', {
        method: 'POST',
        body: {
          title: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
          firstMessage: messageText
        }
      })
      currentConversationId.value = conversationResponse.conversation.id
      
      // Replace temp message with real one from server
      messages.value = conversationResponse.conversation.messages
    } else {
      // Add user message to existing conversation
      const userMessageResponse = await $fetch<{message: Message}>(`/api/conversations/${currentConversationId.value}/messages`, {
        method: 'POST',
        body: {
          role: 'user',
          content: messageText
        }
      })
      
      // Replace temp message with real one
      messages.value[messages.value.length - 1] = userMessageResponse.message
    }

    // Send to AI
    const response = await $fetch<{message: string, model: string, responseMetadata: any}>('/api/chat', {
      method: 'POST',
      body: {
        message: messageText
      }
    })

    // Save AI response to conversation and add to UI
    if (currentConversationId.value) {
      const aiMessageResponse = await $fetch<{message: Message}>(`/api/conversations/${currentConversationId.value}/messages`, {
        method: 'POST',
        body: {
          role: 'assistant',
          content: response.message,
          responseMetadata: response.responseMetadata
        }
      })
      
      messages.value.push(aiMessageResponse.message)
      scrollToBottom()
    }
    
  } catch (err: any) {
    error.value = `Błąd komunikacji: ${err.message || 'Nieznany błąd'}`
    // Remove temp user message on error
    messages.value = messages.value.filter(m => m.id !== tempUserMessage.id)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.chat-panel {
  font-family: 'Inter', sans-serif;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>