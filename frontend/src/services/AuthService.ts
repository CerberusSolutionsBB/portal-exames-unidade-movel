import axios, { type AxiosInstance } from 'axios'
import type { AccessResponse, LoginCredentials } from '@/types/auth'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
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
    const { data } = await api.post<AccessResponse>('/acesso', credentials)
    return data
  },

  async status(): Promise<AccessResponse> {
    const { data } = await api.get<AccessResponse>('/exames/status')
    return data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },
}
