<template>
  <div class="chat-panel p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Panel rozmowy AI</h2>
    
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

    <div class="voice-controls mb-6 flex gap-4">
      <button 
        @click="startListening" 
        :disabled="isListening" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        🎙️ {{ isListening ? 'Słucham...' : 'Nagraj' }}
      </button>
      
      <button 
        @click="stopListening" 
        :disabled="!isListening"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        ⏹️ Stop
      </button>
      
      <button 
        @click="sendMessage"
        :disabled="!finalTranscript.trim() || isLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isLoading ? 'Wysyłam...' : 'Wyślij' }}
      </button>
    </div>

    <div class="transcript-area mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Twoje pytanie:</label>
      <textarea 
        v-model="currentTranscript" 
        readonly
        class="w-full p-3 border border-gray-300 rounded-md bg-gray-50 min-h-[100px]"
        placeholder="Naciśnij 'Nagraj' i zacznij mówić..."
      />
    </div>

    <div class="response-area">
      <label class="block text-sm font-medium text-gray-700 mb-2">Odpowiedź AI:</label>
      <div 
        class="w-full p-4 border border-gray-300 rounded-md bg-gray-50 min-h-[120px] whitespace-pre-wrap"
        :class="{ 'animate-pulse': isLoading }"
      >
        {{ aiResponse || 'Tutaj pojawi się odpowiedź...' }}
      </div>
    </div>

    <div v-if="error" class="error-message mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const isListening = ref(false)
const isLoading = ref(false)
const finalTranscript = ref('')
const currentTranscript = ref('')
const aiResponse = ref('')
const error = ref('')
const availableModels = ref<Array<{id: string, name: string, isFree: boolean}>>([])
const currentModel = ref('mistralai/devstral-small:free')
const preferredModels = ref<string[]>([])
const isLoadingModels = ref(false)

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

onMounted(() => {
  loadUserModelData()
  loadAvailableModels()
  
  if (typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      recognition = new SpeechRecognition()
      recognition.lang = 'pl-PL'
      recognition.interimResults = true
      recognition.continuous = false

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i]
          transcript += res[0].transcript
          if (res.isFinal) {
            finalTranscript.value += res[0].transcript + ' '
          }
        }
        currentTranscript.value = finalTranscript.value + transcript
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

const sendMessage = async () => {
  if (!finalTranscript.value.trim()) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<{message: string}>('/api/chat', {
      method: 'POST',
      body: {
        message: finalTranscript.value.trim()
      }
    })
    
    aiResponse.value = response.message
  } catch (err: any) {
    error.value = `Błąd komunikacji: ${err.message || 'Nieznany błąd'}`
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