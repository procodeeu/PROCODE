<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p class="text-gray-600">Manage your AI assistant and conversations</p>
          </div>
          <div class="flex items-center space-x-3">
            <NuxtLink to="/context" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              🧠 Mój Kontekst
            </NuxtLink>
            <NuxtLink to="/conversations" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              💬 Archiwum rozmów
            </NuxtLink>
            <NuxtLink to="/models" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              🤖 Lista modeli AI 
            </NuxtLink>
            <button @click="logout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-indigo-100 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Conversations</p>
              <p class="text-2xl font-semibold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l6.586 6.586a2 2 0 002.828 0l6.586-6.586A2 2 0 0019.414 5H4.586A2 2 0 003 6.414z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Proactive Messages</p>
              <p class="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Since</p>
              <p class="text-2xl font-semibold text-gray-900">7 days</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Panel -->
      <div class="mb-6">
        <ChatPanel />
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Telegram Setup -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">🤖 Telegram Integration</h3>
          <p class="text-gray-600 mb-4">Połącz swój Telegram aby otrzymywać proaktywne powiadomienia od AI</p>
          <div class="space-y-3">
            <button 
              @click="generateTelegramToken"
              :disabled="isGeneratingToken"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
            >
              {{ isGeneratingToken ? '⏳ Generowanie...' : '📱 Połącz z Telegram' }}
            </button>
            
            <!-- Error message -->
            <div v-if="tokenError" class="bg-red-50 border border-red-200 rounded-md p-3">
              <p class="text-red-600 text-sm">{{ tokenError }}</p>
            </div>
            
            <!-- Token instructions -->
            <div v-if="showTokenInstructions" class="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
              <h4 class="font-medium text-blue-900">📋 Instrukcje połączenia:</h4>
              <ol class="text-sm text-blue-800 space-y-1">
                <li>1. Otwórz Telegram i znajdź <strong>@procodeeu_bot</strong></li>
                <li>2. Wyślij następującą komendę (kliknij aby skopiować):</li>
              </ol>
              <div 
                @click="copyTokenToClipboard"
                class="bg-gray-100 p-2 rounded font-mono text-sm cursor-pointer hover:bg-gray-200 border"
              >
                /connect {{ telegramToken }}
              </div>
              <p class="text-xs text-blue-600">Token jest ważny przez 24 godziny</p>
            </div>
            
            <p class="text-xs text-gray-500">
              Kliknij aby wygenerować unikalny token, następnie napisz do @procodeeu_bot
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-6 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <p class="text-sm text-gray-600">AI sent you a proactive suggestion about your morning routine</p>
              <span class="text-xs text-gray-400 ml-auto">2 hours ago</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <p class="text-sm text-gray-600">New conversation started: "Help with project planning"</p>
              <span class="text-xs text-gray-400 ml-auto">1 day ago</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              <p class="text-sm text-gray-600">Account created and Telegram connected</p>
              <span class="text-xs text-gray-400 ml-auto">1 week ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isGeneratingToken = ref(false)
const telegramToken = ref('')
const showTokenInstructions = ref(false)
const tokenError = ref('')

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}

const generateTelegramToken = async () => {
  isGeneratingToken.value = true
  tokenError.value = ''
  telegramToken.value = ''
  showTokenInstructions.value = false
  
  try {
    const response = await $fetch('/api/user/telegram-token', {
      method: 'POST'
    })
    
    if (response.success) {
      telegramToken.value = response.token
      showTokenInstructions.value = true
    }
  } catch (error) {
    tokenError.value = `Błąd podczas generowania tokenu: ${error.message || 'Nieznany błąd'}`
  } finally {
    isGeneratingToken.value = false
  }
}

const copyTokenToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(`/connect ${telegramToken.value}`)
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

useSeoMeta({
  title: 'Dashboard - PROCODE',
  description: 'Your AI assistant dashboard'
})
</script>