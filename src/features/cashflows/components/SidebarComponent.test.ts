import { describe, it, expect } from 'vitest'
import { renderWithProviders, nextTick } from '@/test-utils'
import SidebarComponent from './SidebarComponent.vue'

describe('SidebarComponent', () => {
  it('renders all main menu links and highlights active link on /', () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isOpen: false },
      initialRoute: '/'
    })

    expect(wrapper.text()).toContain('Ringkasan Arus Kas')
    expect(wrapper.text()).toContain('Direktori Pengguna')
    expect(wrapper.text()).toContain('Profil Saya')
    expect(wrapper.find('a#nav-link-cashflow').classes()).toContain('bg-indigo-600')
  })

  it('highlights active link on /users', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, {
      props: { isOpen: false }
    })
    await router.push('/users')
    await nextTick()

    expect(wrapper.find('a#nav-link-users').classes()).toContain('bg-indigo-600')
  })

  it('highlights active link on /profile', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, {
      props: { isOpen: false }
    })
    await router.push('/profile')
    await nextTick()

    expect(wrapper.find('a#nav-link-profile').classes()).toContain('bg-indigo-600')
  })

  it('highlights cashflow link on /cash-flows/1', async () => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, {
      props: { isOpen: false }
    })
    await router.push('/cash-flows/1')
    await nextTick()

    expect(wrapper.find('a#nav-link-cashflow').classes()).toContain('bg-indigo-600')
  })

  it('applies open translate class when isOpen is true', () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isOpen: true }
    })

    expect(wrapper.find('aside').classes()).toContain('translate-x-0')
  })

  it('emits close-sidebar when close button is clicked', async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isOpen: true }
    })

    const closeBtn = wrapper.find('button[aria-label="Tutup navigasi samping"]')
    await closeBtn.trigger('click')

    expect(wrapper.emitted('close-sidebar')).toBeTruthy()
  })

  it('emits close-sidebar when nav link is clicked', async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isOpen: true }
    })

    await wrapper.find('a#nav-link-cashflow').trigger('click')
    await wrapper.find('a#nav-link-users').trigger('click')
    await wrapper.find('a#nav-link-profile').trigger('click')

    expect(wrapper.emitted('close-sidebar')?.length).toBe(3)
  })
})
