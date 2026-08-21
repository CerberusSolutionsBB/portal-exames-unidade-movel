import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const authGuard: NavigationGuard = () => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }

  return true
}
