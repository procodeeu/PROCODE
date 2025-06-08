import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/login/', { email, password })
      
      if (response.data.success) {
        user.value = response.data.user
        return { success: true }
      } else {
        error.value = response.data.error || 'Login failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Network error'
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const register = async (email, password, username) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/register/', { email, password, username })
      
      if (response.data.success) {
        user.value = response.data.user
        return { success: true }
      } else {
        error.value = response.data.error || 'Registration failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Network error'
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
    }
  }

  const checkAuth = async () => {
    try {
      // Try to get user info to check if authenticated
      const response = await api.get('/auth/current-model/')
      if (response.data.currentModel !== undefined) {
        // User is authenticated, fetch full user data
        // This is a simplified check - in a real app you'd have a proper user endpoint
        user.value = { 
          email: 'user@example.com', // This should come from a real endpoint
          currentModel: response.data.currentModel 
        }
      }
    } catch (err) {
      user.value = null
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  }
})