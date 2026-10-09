import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, createTestRouter, flushPromises } from '@/test-utils'
import CashFlowLayout from './CashFlowLayout.vue'
import SidebarComponent from '@/features/cashflows/components/SidebarComponent.vue'
import { useAuthStore } from '@/features/auth/states/authStore'
import { useUsersStore } from '@/features/users/states/usersStore'

describe('CashFlowLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /auth/login when user is not authenticated', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.token = null

    const router = createTestRouter('/')
    const routerPushSpy = vi.spyOn(router, 'push')

    renderWithProviders(CashFlowLayout, { pinia, router })
    await flushPromises()

    expect(routerPushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('renders layout and fetches user profile when authenticated', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.token = 'valid-token'

    const usersStore = useUsersStore(pinia)
    const fetchProfileSpy = vi.spyOn(usersStore, 'fetchProfile').mockResolvedValue({} as any)

    const { wrapper } = renderWithProviders(CashFlowLayout, { pinia })
    await flushPromises()

    expect(fetchProfileSpy).toHaveBeenCalled()
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('renders custom slot content', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.token = 'valid-token'

    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchProfile').mockResolvedValue({} as any)

    const { wrapper } = renderWithProviders(CashFlowLayout, {
      pinia,
      slots: {
        default: '<div id="custom-child">Slot Content</div>'
      }
    })
    await flushPromises()

    expect(wrapper.find('#custom-child').text()).toBe('Slot Content')
  })

  it('toggles mobile sidebar and closes on backdrop click and on close-sidebar event', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.token = 'valid-token'

    const { wrapper } = renderWithProviders(CashFlowLayout, { pinia })
    await flushPromises()

    const toggleBtn = wrapper.find('button#btn-sidebar-toggle')
    await toggleBtn.trigger('click')

    const backdrop = wrapper.find('div.fixed.inset-0.bg-slate-900\\/50')
    expect(backdrop.exists()).toBe(true)

    // Test sidebar close event
    const sidebar = wrapper.findComponent(SidebarComponent)
    sidebar.vm.$emit('close-sidebar')
    await flushPromises()

    expect(wrapper.find('div.fixed.inset-0.bg-slate-900\\/50').exists()).toBe(false)

    // Toggle again and click backdrop
    await toggleBtn.trigger('click')
    const backdropAgain = wrapper.find('div.fixed.inset-0.bg-slate-900\\/50')
    await backdropAgain.trigger('click')
    expect(wrapper.find('div.fixed.inset-0.bg-slate-900\\/50').exists()).toBe(false)
  })

  it('logs out and redirects to /auth/login when fetchProfile fails', async () => {
    const pinia = createMockPinia()
    const authStore = useAuthStore(pinia)
    authStore.token = 'expired-token'

    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchProfile').mockRejectedValue(new Error('Session expired'))
    const logoutSpy = vi.spyOn(authStore, 'logout')

    const router = createTestRouter('/')
    const routerPushSpy = vi.spyOn(router, 'push')

    renderWithProviders(CashFlowLayout, { pinia, router })
    await flushPromises()

    expect(logoutSpy).toHaveBeenCalled()
    expect(routerPushSpy).toHaveBeenCalledWith('/auth/login')
  })
})
