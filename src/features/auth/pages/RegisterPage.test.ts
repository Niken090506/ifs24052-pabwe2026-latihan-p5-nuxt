import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import RegisterPage from './RegisterPage.vue'
import { useAuthStore } from '@/features/auth/states/authStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders register form elements and link to login', () => {
    const { wrapper } = renderWithProviders(RegisterPage)

    expect(wrapper.find('input#register-name-input').exists()).toBe(true)
    expect(wrapper.find('input#register-email-input').exists()).toBe(true)
    expect(wrapper.find('input#register-password-input').exists()).toBe(true)
    expect(wrapper.find('button#register-submit-button').exists()).toBe(true)
    expect(wrapper.find('a#link-to-login').exists()).toBe(true)
  })

  it('validates empty inputs on submit', async () => {
    const { wrapper } = renderWithProviders(RegisterPage)
    const authStore = useAuthStore()
    const registerSpy = vi.spyOn(authStore, 'register')

    await wrapper.find('form').trigger('submit.prevent')

    expect(registerSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Nama lengkap wajib diisi')
    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Kata sandi wajib diisi')
  })

  it('successfully submits registration and redirects to login', async () => {
    const { wrapper, router } = renderWithProviders(RegisterPage)
    const authStore = useAuthStore()
    const registerSpy = vi.spyOn(authStore, 'register').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()
    const routerPushSpy = vi.spyOn(router, 'push')

    await wrapper.find('input#register-name-input').setValue('Delcom Student')
    await wrapper.find('input#register-email-input').setValue('student@delcom.org')
    await wrapper.find('input#register-password-input').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(registerSpy).toHaveBeenCalledWith({
      name: 'Delcom Student',
      email: 'student@delcom.org',
      password: 'password123'
    })
    expect(successSpy).toHaveBeenCalled()
    expect(routerPushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('shows error dialog when registration fails', async () => {
    const { wrapper } = renderWithProviders(RegisterPage)
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockRejectedValue(new Error('Email sudah terdaftar'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('input#register-name-input').setValue('Delcom Student')
    await wrapper.find('input#register-email-input').setValue('existing@delcom.org')
    await wrapper.find('input#register-password-input').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Email sudah terdaftar')
  })

  it('shows fallback error dialog when error has no message', async () => {
    const { wrapper } = renderWithProviders(RegisterPage)
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'register').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('input#register-name-input').setValue('Delcom Student')
    await wrapper.find('input#register-email-input').setValue('existing@delcom.org')
    await wrapper.find('input#register-password-input').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Pendaftaran gagal. Silakan coba lagi.')
  })

  it('shows loading state when authStore.isLoading is true', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.isLoading = true

    const { wrapper } = renderWithProviders(RegisterPage, { pinia })
    await flushPromises()

    expect(wrapper.find('button#register-submit-button').text()).toContain('Mendaftarkan Akun...')
    expect(wrapper.find('button#register-submit-button').attributes('disabled')).toBeDefined()
  })
})
