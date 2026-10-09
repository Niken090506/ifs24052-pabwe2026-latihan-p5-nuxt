import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'
import * as authApi from '@/features/auth/api/authApi'
import * as apiHelper from '@/helpers/apiHelper'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(apiHelper, 'getAccessToken').mockReturnValue(null)
  })

  it('initializes with default state and checks isAuthenticated getter', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.isAuthenticated).toBe(false)

    store.token = 'active-token'
    expect(store.isAuthenticated).toBe(true)
  })

  it('runs initAuth to load token from localStorage', () => {
    vi.spyOn(apiHelper, 'getAccessToken').mockReturnValue('stored-token')
    const store = useAuthStore()
    store.initAuth()
    expect(store.token).toBe('stored-token')
  })

  it('updates user using setUser', () => {
    const store = useAuthStore()
    const mockUser = { id: 1, name: 'Delcom User', email: 'delcom@test.com' }
    store.setUser(mockUser)
    expect(store.user).toEqual(mockUser)
  })

  it('successfully logs in, saves token, and updates state', async () => {
    const mockResponse = {
      status: 'success',
      message: 'Berhasil login',
      data: {
        token: 'auth-jwt-token',
        user: { id: 2, name: 'Alice', email: 'alice@delcom.org' }
      }
    }
    vi.spyOn(authApi, 'loginApi').mockResolvedValue(mockResponse)
    const putTokenSpy = vi.spyOn(apiHelper, 'putAccessToken')

    const store = useAuthStore()
    const res = await store.login({ email: 'alice@delcom.org', password: 'password' })

    expect(res).toEqual(mockResponse)
    expect(store.token).toBe('auth-jwt-token')
    expect(store.user).toEqual(mockResponse.data.user)
    expect(store.isLoading).toBe(false)
    expect(putTokenSpy).toHaveBeenCalledWith('auth-jwt-token')
  })

  it('resets isLoading on login error', async () => {
    vi.spyOn(authApi, 'loginApi').mockRejectedValue(new Error('Invalid credentials'))
    const store = useAuthStore()

    await expect(store.login({ email: 'bad@delcom.org', password: 'bad' })).rejects.toThrow('Invalid credentials')
    expect(store.isLoading).toBe(false)
    expect(store.token).toBeNull()
  })

  it('successfully registers new user', async () => {
    const mockResponse = { status: 'success', message: 'Registered' }
    vi.spyOn(authApi, 'registerApi').mockResolvedValue(mockResponse)

    const store = useAuthStore()
    const res = await store.register({ name: 'Bob', email: 'bob@delcom.org', password: 'password' })

    expect(res).toEqual(mockResponse)
    expect(store.isLoading).toBe(false)
  })

  it('resets isLoading on register error', async () => {
    vi.spyOn(authApi, 'registerApi').mockRejectedValue(new Error('Email already registered'))
    const store = useAuthStore()

    await expect(store.register({ name: 'Bob', email: 'bob@delcom.org', password: 'password' })).rejects.toThrow('Email already registered')
    expect(store.isLoading).toBe(false)
  })

  it('logs out and clears session even if logoutApi rejects', async () => {
    vi.spyOn(authApi, 'logoutApi').mockRejectedValue(new Error('Network error on logout'))
    const putTokenSpy = vi.spyOn(apiHelper, 'putAccessToken')

    const store = useAuthStore()
    store.token = 'existing-token'
    store.user = { id: 5, name: 'Test', email: 'test@delcom.org' }

    await store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(putTokenSpy).toHaveBeenCalledWith(null)
  })

  it('logs out smoothly when logoutApi succeeds', async () => {
    vi.spyOn(authApi, 'logoutApi').mockResolvedValue({ status: 'success', message: 'Logged out' })
    const store = useAuthStore()
    store.token = 'tok'

    await store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })
})
