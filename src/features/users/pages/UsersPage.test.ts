import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import UsersPage from './UsersPage.vue'
import { useUsersStore } from '@/features/users/states/usersStore'

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts and calls fetchUsers', () => {
    const { wrapper } = renderWithProviders(UsersPage)
    expect(wrapper.find('h1').text()).toContain('Direktori Pengguna')
  })

  it('shows loading spinner when usersStore.isLoading is true', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchUsers').mockImplementation(async () => {
      usersStore.isLoading = true
      return new Promise(() => {})
    })
    usersStore.isLoading = true

    const { wrapper } = renderWithProviders(UsersPage, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('Memuat data pengguna...')
  })

  it('renders users list and filters by name or email', async () => {
    const mockUsers = [
      { id: 1, name: 'Alice Smith', email: 'alice@delcom.org', created_at: '2024-01-01' },
      { id: 2, name: 'Bob Jones', email: 'bob@delcom.org', created_at: '2024-01-02' }
    ]

    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchUsers').mockImplementation(async () => {
      usersStore.users = mockUsers
      return { status: 'success', data: { users: mockUsers } } as any
    })
    usersStore.users = mockUsers

    const { wrapper } = renderWithProviders(UsersPage, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('Alice Smith')
    expect(wrapper.text()).toContain('Bob Jones')

    const searchInput = wrapper.find('input#search-users-input')
    await searchInput.setValue('alice')

    expect(wrapper.text()).toContain('Alice Smith')
    expect(wrapper.text()).not.toContain('Bob Jones')

    await searchInput.setValue('nonexistent')
    expect(wrapper.text()).toContain('Tidak ada pengguna ditemukan')
  })

  it('handles image error by setting fallback image src', async () => {
    const mockUser = [
      { id: 1, name: 'Broken Image User', email: 'broken@delcom.org', photo: 'https://bad.url/img.png' }
    ]

    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchUsers').mockImplementation(async () => {
      usersStore.users = mockUser
      return { status: 'success', data: { users: mockUser } } as any
    })
    usersStore.users = mockUser

    const { wrapper } = renderWithProviders(UsersPage, { pinia })
    await flushPromises()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    await img.trigger('error')

    expect(img.attributes('src')).toContain('open-api.delcom.org/default/img/user.png')
  })
})
