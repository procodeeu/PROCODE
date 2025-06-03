<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Modele OpenRouter</h1>
            <p class="text-gray-600">Przeglądaj dostępne modele AI i ich parametry</p>
          </div>
          <button @click="$router.back()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            ← Powrót
          </button>
        </div>
      </div>

      <!-- Models Table -->
      <ModelsTable />
    </div>
  </div>
</template>

<script setup>
// Protect this page - require authentication
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Modele AI - PROCODE',
  description: 'Przeglądaj dostępne modele OpenRouter AI'
})
</script>