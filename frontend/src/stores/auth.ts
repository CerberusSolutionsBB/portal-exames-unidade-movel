import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthService } from '@/services/AuthService'
import type { AccessResponse, LoginCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const status = ref<string | null>(null)
  const message = ref<string | null>(null)
  const isLoading = ref(false)
  const fieldErrors = ref<Record<string, string>>({})

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    fieldErrors.value = {}

    try {
      const data: AccessResponse = await AuthService.access(credentials)

      token.value = data.token
      status.value = data.status
      message.value = data.message

      localStorage.setItem('access_token', data.token)

      return true
    } catch (error) {
      const errors = (error as { response?: { data?: { errors?: Record<string, string> } } })
        ?.response?.data?.errors

      if (errors) {
        fieldErrors.value = errors
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await AuthService.logout()
    } catch {
      // token may already be expired — clear local state regardless
    }

    reset()
  }

  function reset(): void {
    token.value = null
    status.value = null
    message.value = null
    fieldErrors.value = {}
    localStorage.removeItem('access_token')
  }

  return {
    token,
    status,
    message,
    isLoading,
    fieldErrors,
    isAuthenticated,
    login,
    logout,
    reset,
  }
})
