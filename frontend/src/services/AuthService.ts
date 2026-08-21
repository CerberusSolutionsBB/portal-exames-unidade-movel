import axios, { type AxiosInstance } from 'axios'
import { DemoAccessBackend } from '@/services/DemoAccessBackend'
import type { AccessResponse, LoginCredentials } from '@/types/auth'

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

/**
 * Sem base URL configurada não existe API para chamar: uma requisição relativa
 * cairia na origem do site (em hospedagem estática isso vira 405/404).
 * Nesse caso o app opera em modo demonstração, no próprio navegador.
 */
export const isDemoMode = baseURL === ''

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
    }

    return Promise.reject(error)
  },
)

export const AuthService = {
  async access(credentials: LoginCredentials): Promise<AccessResponse> {
    if (isDemoMode) return DemoAccessBackend.access(credentials)

    const { data } = await api.post<AccessResponse>('/acesso', credentials)
    return data
  },

  async status(): Promise<AccessResponse> {
    if (isDemoMode) return DemoAccessBackend.status()

    const { data } = await api.get<AccessResponse>('/exames/status')
    return data
  },

  async logout(): Promise<void> {
    if (isDemoMode) return DemoAccessBackend.logout()

    await api.post('/logout')
  },
}
