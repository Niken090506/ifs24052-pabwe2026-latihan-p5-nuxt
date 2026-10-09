import { defineStore } from 'pinia'
import { getAccessToken, putAccessToken } from '@/helpers/apiHelper'
import {
  loginApi,
  registerApi,
  logoutApi,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload
} from '@/features/auth/api/authApi'

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: getAccessToken(),
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token)
  },

  actions: {
    initAuth() {
      const storedToken = getAccessToken()
      if (storedToken) {
        this.token = storedToken
      }
    },

    setUser(user: AuthUser | null) {
      this.user = user
    },

    async login(payload: LoginPayload) {
      this.isLoading = true
      try {
        const response = await loginApi(payload)
        this.token = response.data.token
        this.user = response.data.user
        putAccessToken(response.data.token)
        return response
      } finally {
        this.isLoading = false
      }
    },

    async register(payload: RegisterPayload) {
      this.isLoading = true
      try {
        const response = await registerApi(payload)
        return response
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        try {
          await logoutApi()
        } catch {
          // Ignore API error on logout to ensure local state is cleared
        }
        this.user = null
        this.token = null
        putAccessToken(null)
      } finally {
        this.isLoading = false
      }
    }
  }
})
