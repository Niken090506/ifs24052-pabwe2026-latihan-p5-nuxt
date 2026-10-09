import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import NavbarComponent from './NavbarComponent.vue'
import { useAuthStore } from '@/features/auth/states/authStore'
import { useUsersStore } from '@/features/users/states/usersStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders brand and session status badge and default Pengguna when stores are empty', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    const usersStore = useUsersStore(pinia)
    authStore.user = null
    usersStore.currentUser = null

    const { wrapper } = renderWithProviders(NavbarComponent, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('Delcom Cash Flow')
    expect(wrapper.find('#session-status-text').text()).toBe('Sesi Aktif')
    expect(wrapper.find('#navbar-user-name').text()).toBe('Pengguna')
    expect(wrapper.find('#navbar-user-email').text()).toBe('user@delcom.org')
  })

  it('displays user name and email from usersStore', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = {
      id: 1,
      name: 'John Delcom',
      email: 'john@delcom.org',
      photo: 'https://img.test/pic.png'
    }

    const { wrapper } = renderWithProviders(NavbarComponent, { pinia })
    await flushPromises()

    expect(wrapper.find('#navbar-user-name').text()).toBe('John Delcom')
    expect(wrapper.find('#navbar-user-email').text()).toBe('john@delcom.org')
    expect(wrapper.find('img').attributes('src')).toBe('https://img.test/pic.png')
  })

  it('falls back to authStore user if usersStore currentUser is null', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.user = {
      id: 2,
      name: 'Fallback Auth User',
      email: 'fallback@delcom.org',
      photo: 'https://img.test/auth.png'
    }

    const { wrapper } = renderWithProviders(NavbarComponent, { pinia })
    await flushPromises()

    expect(wrapper.find('#navbar-user-name').text()).toBe('Fallback Auth User')
    expect(wrapper.find('#navbar-user-email').text()).toBe('fallback@delcom.org')
    expect(wrapper.find('img').attributes('src')).toBe('https://img.test/auth.png')
  })

  it('emits toggle-sidebar event when mobile button clicked', async () => {
    const { wrapper } = renderWithProviders(NavbarComponent)
    const toggleBtn = wrapper.find('button#btn-sidebar-toggle')
    await toggleBtn.trigger('click')

    expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
  })

  it('handles image error fallback', async () => {
    const { wrapper } = renderWithProviders(NavbarComponent)
    const img = wrapper.find('img')
    await img.trigger('error')

    expect(img.attributes('src')).toContain('open-api.delcom.org/default/img/user.png')
  })

  it('handles logout confirmed: calls authStore.logout and redirects to /auth/login', async () => {
    const { wrapper, router } = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue()
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()
    const routerPushSpy = vi.spyOn(router, 'push')

    await wrapper.find('button#btn-navbar-logout').trigger('click')

    expect(logoutSpy).toHaveBeenCalled()
    expect(routerPushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('does nothing when logout is cancelled', async () => {
    const { wrapper } = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'logout')
    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(false)

    await wrapper.find('button#btn-navbar-logout').trigger('click')

    expect(logoutSpy).not.toHaveBeenCalled()
  })
})
