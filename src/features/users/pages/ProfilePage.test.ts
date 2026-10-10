import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import ProfilePage from './ProfilePage.vue'
import { useUsersStore } from '@/features/users/states/usersStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser = {
    id: 1,
    name: 'Budi Santoso',
    email: 'budi@delcom.org',
    photo: 'https://example.com/budi.jpg',
    created_at: '2024-02-01'
  }

  it('renders profile page with user information', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchProfile').mockImplementation(async () => {
      usersStore.currentUser = mockUser
      return { status: 'success', data: { user: mockUser } } as any
    })
    usersStore.currentUser = mockUser

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('Budi Santoso')
    expect(wrapper.text()).toContain('budi@delcom.org')
  })

  it('handles fetchProfile error on mount', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchProfile').mockRejectedValue(new Error('Gagal memuat profil'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal memuat profil')
  })

  it('handles image error fallback', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const img = wrapper.find('img')
    await img.trigger('error')

    expect(img.attributes('src')).toContain('open-api.delcom.org/default/img/user.png')
  })

  it('uploads photo when file input changes', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser

    const uploadSpy = vi.spyOn(usersStore, 'uploadPhoto').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const fileInput = wrapper.find('input#profile-photo-input')
    const file = new File(['test'], 'new-avatar.png', { type: 'image/png' })

    Object.defineProperty(fileInput.element, 'files', {
      value: [file]
    })

    await fileInput.trigger('change')

    expect(uploadSpy).toHaveBeenCalledWith(file)
    expect(successSpy).toHaveBeenCalledWith('Foto profil berhasil diperbarui!')
  })

  it('shows error dialog when photo upload fails', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser

    vi.spyOn(usersStore, 'uploadPhoto').mockRejectedValue(new Error('Format file tidak didukung'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const fileInput = wrapper.find('input#profile-photo-input')
    const file = new File(['test'], 'bad.pdf', { type: 'application/pdf' })

    Object.defineProperty(fileInput.element, 'files', {
      value: [file]
    })

    await fileInput.trigger('change')
    expect(errorSpy).toHaveBeenCalledWith('Format file tidak didukung')
  })

  it('updates profile name and validates empty input', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchProfile').mockImplementation(async () => {
      usersStore.currentUser = mockUser
      return { status: 'success', data: { user: mockUser } } as any
    })
    usersStore.currentUser = mockUser

    const updateSpy = vi.spyOn(usersStore, 'updateProfile').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const profileForm = wrapper.findAll('form')[0]
    const nameInput = wrapper.find('input#edit-profile-name')

    await nameInput.setValue('')
    await profileForm.trigger('submit.prevent')

    expect(updateSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Nama lengkap tidak boleh kosong')

    await nameInput.setValue('Nama Baru')
    await profileForm.trigger('submit.prevent')

    expect(updateSpy).toHaveBeenCalledWith({ name: 'Nama Baru' })
    expect(successSpy).toHaveBeenCalledWith('Profil berhasil diperbarui!')
  })

  it('shows error dialog when updateProfile fails', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser

    vi.spyOn(usersStore, 'updateProfile').mockRejectedValue(new Error('Nama tidak valid'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const profileForm = wrapper.findAll('form')[0]
    const nameInput = wrapper.find('input#edit-profile-name')

    await nameInput.setValue('Gagal')
    await profileForm.trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Nama tidak valid')
  })

  it('validates change password fields and handles confirmation mismatch', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser
    const changePassSpy = vi.spyOn(usersStore, 'changePassword')

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const passwordForm = wrapper.findAll('form')[1]
    await passwordForm.trigger('submit.prevent')
    expect(changePassSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Kata sandi saat ini wajib diisi')

    await wrapper.find('input#current-password').setValue('old123')
    await wrapper.find('input#new-password').setValue('123')
    await passwordForm.trigger('submit.prevent')
    expect(wrapper.text()).toContain('Kata sandi baru minimal 6 karakter')

    await wrapper.find('input#new-password').setValue('new123456')
    await wrapper.find('input#confirm-new-password').setValue('different123')
    await passwordForm.trigger('submit.prevent')
    expect(wrapper.text()).toContain('Konfirmasi kata sandi tidak cocok')
  })

  it('changes password successfully when valid', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser
    const changePassSpy = vi.spyOn(usersStore, 'changePassword').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const passwordForm = wrapper.findAll('form')[1]
    await wrapper.find('input#current-password').setValue('old123456')
    await wrapper.find('input#new-password').setValue('new123456')
    await wrapper.find('input#confirm-new-password').setValue('new123456')
    await passwordForm.trigger('submit.prevent')

    expect(changePassSpy).toHaveBeenCalledWith({
      password: 'old123456',
      new_password: 'new123456',
      new_password_confirmation: 'new123456'
    })
    expect(successSpy).toHaveBeenCalledWith('Kata sandi berhasil diubah!')
  })

  it('shows error dialog when changePassword fails', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser
    vi.spyOn(usersStore, 'changePassword').mockRejectedValue(new Error('Kata sandi saat ini salah'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const passwordForm = wrapper.findAll('form')[1]
    await wrapper.find('input#current-password').setValue('old123456')
    await wrapper.find('input#new-password').setValue('new123456')
    await wrapper.find('input#confirm-new-password').setValue('new123456')
    await passwordForm.trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Kata sandi saat ini salah')
  })

  it('returns early when photo input changes with no file', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    const uploadSpy = vi.spyOn(usersStore, 'uploadPhoto')

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const fileInput = wrapper.find('input#profile-photo-input')
    Object.defineProperty(fileInput.element, 'files', { value: [] })
    await fileInput.trigger('change')

    expect(uploadSpy).not.toHaveBeenCalled()
  })

  it('shows fallback error dialog when updateProfile fails without message', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser

    vi.spyOn(usersStore, 'updateProfile').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const profileForm = wrapper.findAll('form')[0]
    await wrapper.find('input#edit-profile-name').setValue('Gagal No Msg')
    await profileForm.trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal memperbarui profil')
  })

  it('shows fallback error dialog when photo upload fails without message', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser

    vi.spyOn(usersStore, 'uploadPhoto').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const fileInput = wrapper.find('input#profile-photo-input')
    const file = new File(['test'], 'new.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', { value: [file] })

    await fileInput.trigger('change')
    expect(errorSpy).toHaveBeenCalledWith('Gagal mengunggah foto profil')
  })

  it('shows fallback error dialog when changePassword fails without message', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser
    vi.spyOn(usersStore, 'changePassword').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    const passwordForm = wrapper.findAll('form')[1]
    await wrapper.find('input#current-password').setValue('old123456')
    await wrapper.find('input#new-password').setValue('new123456')
    await wrapper.find('input#confirm-new-password').setValue('new123456')
    await passwordForm.trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal mengubah kata sandi')
  })

  it('displays loading state text when updating profile or changing password', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    usersStore.currentUser = mockUser
    usersStore.isUpdatingProfile = true
    usersStore.isChangingPassword = true

    const { wrapper } = renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    expect(wrapper.find('button#btn-save-profile').text()).toContain('Menyimpan...')
    expect(wrapper.find('button#btn-save-password').text()).toContain('Memperbarui Kata Sandi...')
  })

  it('shows fallback error dialog when fetchProfile fails without message on mount', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    vi.spyOn(usersStore, 'fetchProfile').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal memuat profil pengguna')
  })

  it('silently ignores 401 unauthenticated error when fetchProfile fails on mount', async () => {
    const pinia = createMockPinia()
    const usersStore = useUsersStore(pinia)
    const authErr = new Error('Belum melakukan autentikasi') as any
    authErr.status = 401
    vi.spyOn(usersStore, 'fetchProfile').mockRejectedValue(authErr)
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    renderWithProviders(ProfilePage, { pinia })
    await flushPromises()

    expect(errorSpy).not.toHaveBeenCalled()
  })
})
