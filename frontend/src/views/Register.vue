<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-white">
          Dołącz do PROCODE
        </h2>
        <p class="mt-2 text-sm text-gray-400">
          Masz już konto? 
          <router-link to="/login" class="text-blue-400 hover:text-blue-300">
            Zaloguj się
          </router-link>
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div v-if="error" class="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
              Nazwa użytkownika
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              v-model="username"
              class="form-input"
              placeholder="Wprowadź nazwę użytkownika"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="email"
              class="form-input"
              placeholder="Wprowadź swój email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="password"
              class="form-input"
              placeholder="Wprowadź hasło (min. 8 znaków)"
              minlength="8"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
              Potwierdź hasło
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              v-model="confirmPassword"
              class="form-input"
              placeholder="Potwierdź hasło"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Rejestracja...</span>
            <span v-else">Zarejestruj się</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleRegister = async () => {
      // Validation
      if (!username.value || !email.value || !password.value || !confirmPassword.value) {
        error.value = 'Wszystkie pola są wymagane'
        return
      }

      if (password.value !== confirmPassword.value) {
        error.value = 'Hasła nie są identyczne'
        return
      }

      if (password.value.length < 8) {
        error.value = 'Hasło musi mieć co najmniej 8 znaków'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const result = await authStore.register(email.value, password.value, username.value)
        
        if (result.success) {
          router.push('/dashboard')
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Wystąpił błąd podczas rejestracji'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      email,
      password,
      confirmPassword,
      error,
      loading,
      handleRegister
    }
  }
}
</script>