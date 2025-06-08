<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <!-- Hero Section -->
      <div class="fade-in">
        <h1 class="text-6xl font-bold text-white mb-6">
          <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PROCODE
          </span>
          <br>
          <span class="text-4xl">AI Assistant</span>
        </h1>
        
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Inteligentny asystent AI z integracją Telegram. 
          Prowadź rozmowy, zarządzaj kontekstem i otrzymuj proaktywne powiadomienia.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <router-link 
            to="/register" 
            class="btn btn-primary text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Rozpocznij za darmo
          </router-link>
          
          <router-link 
            to="/login" 
            class="btn btn-secondary text-lg px-8 py-3 bg-gray-700 hover:bg-gray-600 transition-all"
          >
            Zaloguj się
          </router-link>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-8 mt-16">
          <div class="card p-6 text-center hover:bg-gray-750 transition-all">
            <div class="text-blue-400 text-4xl mb-4">🤖</div>
            <h3 class="text-xl font-semibold text-white mb-2">AI Chat</h3>
            <p class="text-gray-400">
              Prowadź inteligentne rozmowy z zaawansowanymi modelami AI
            </p>
          </div>

          <div class="card p-6 text-center hover:bg-gray-750 transition-all">
            <div class="text-blue-400 text-4xl mb-4">📱</div>
            <h3 class="text-xl font-semibold text-white mb-2">Telegram Bot</h3>
            <p class="text-gray-400">
              Otrzymuj proaktywne wiadomości bezpośrednio na Telegram
            </p>
          </div>

          <div class="card p-6 text-center hover:bg-gray-750 transition-all">
            <div class="text-blue-400 text-4xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold text-white mb-2">Kontekst życiowy</h3>
            <p class="text-gray-400">
              Spersonalizuj AI na podstawie swojego kontekstu i preferencji
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>