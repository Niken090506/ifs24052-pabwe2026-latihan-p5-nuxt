import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import LoginPage from './LoginPage.vue'
import { useAuthStore } from '@/features/auth/states/authStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form elements and links', () => {
    const { wrapper } = renderWithProviders(LoginPage)

    expect(wrapper.find('input#login-email').exists()).toBe(true)
    expect(wrapper.find('input#login-password').exists()).toBe(true)
    expect(wrapper.find('button#btn-login-submit').exists()).toBe(true)
    expect(wrapper.find('a#link-to-register').exists()).toBe(true)
  })

  it('validates required fields before submitting', async () => {
    const { wrapper } = renderWithProviders(LoginPage)
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login')

    await wrapper.find('form').trigger('submit.prevent')

    expect(loginSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
  })

  it('submits form successfully and navigates to home', async () => {
    const { wrapper, router } = renderWithProviders(LoginPage)
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()
    const routerPushSpy = vi.spyOn(router, 'push')

    await wrapper.find('input#login-email').setValue('user@delcom.org')
    await wrapper.find('input#login-password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'user@delcom.org',
      password: 'password123'
    })
    expect(successSpy).toHaveBeenCalled()
    expect(routerPushSpy).toHaveBeenCalledWith('/')
  })

  it('shows error dialog when login fails', async () => {
    const { wrapper } = renderWithProviders(LoginPage)
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockRejectedValue(new Error('Kredensial tidak valid'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('input#login-email').setValue('wrong@delcom.org')
    await wrapper.find('input#login-password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Kredensial tidak valid')
  })

  it('shows fallback error dialog when error has no message', async () => {
    const { wrapper } = renderWithProviders(LoginPage)
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('input#login-email').setValue('wrong@delcom.org')
    await wrapper.find('input#login-password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal masuk, periksa email dan kata sandi Anda.')
  })

  it('displays loading state when authStore.isLoading is true', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.isLoading = true

    const { wrapper } = renderWithProviders(LoginPage, { pinia })
    await flushPromises()

    expect(wrapper.find('button#btn-login-submit').text()).toContain('Memproses Masuk...')
    expect(wrapper.find('button#btn-login-submit').attributes('disabled')).toBeDefined()
  })
})
