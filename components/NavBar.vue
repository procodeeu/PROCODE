<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <h1 class="text-2xl font-bold text-indigo-600">PROCODE</h1>
          </NuxtLink>
        </div>
        
        <div class="flex items-center space-x-4">
          <NuxtLink to="/features" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
            Features
          </NuxtLink>
          <NuxtLink to="/pricing" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
            Pricing
          </NuxtLink>
          <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
            Sign In
          </NuxtLink>
          <NuxtLink to="/register" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Get Started
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>