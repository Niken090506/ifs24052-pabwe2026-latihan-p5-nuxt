import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from './usersStore'
import * as userApi from '@/features/users/api/userApi'

describe('useUsersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state and sets currentUser', () => {
    const store = useUsersStore()
    expect(store.users).toEqual([])
    expect(store.currentUser).toBeNull()
    expect(store.isLoading).toBe(false)

    store.setCurrentUser({ id: 1, name: 'Delcom', email: 'd@delcom.org' })
    expect(store.currentUser?.name).toBe('Delcom')
  })

  it('fetches users list and handles empty fallback', async () => {
    const mockUsers = [{ id: 1, name: 'Alice', email: 'alice@delcom.org' }]
    vi.spyOn(userApi, 'getUsersApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: { users: mockUsers }
    } as any)

    const store = useUsersStore()
    const res = await store.fetchUsers()

    expect(res.data.users).toEqual(mockUsers)
    expect(store.users).toEqual(mockUsers)
    expect(store.isLoading).toBe(false)
  })

  it('handles fetchUsers when response.data or users is empty/undefined', async () => {
    vi.spyOn(userApi, 'getUsersApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: {}
    } as any)

    const store = useUsersStore()
    await store.fetchUsers()
    expect(store.users).toEqual([])
  })

  it('resets isLoading when fetchUsers fails', async () => {
    vi.spyOn(userApi, 'getUsersApi').mockRejectedValue(new Error('Fetch failed'))
    const store = useUsersStore()

    await expect(store.fetchUsers()).rejects.toThrow('Fetch failed')
    expect(store.isLoading).toBe(false)
  })

  it('fetches user profile successfully', async () => {
    const mockProfile = { id: 2, name: 'Bob', email: 'bob@delcom.org' }
    vi.spyOn(userApi, 'getProfileApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: { user: mockProfile }
    } as any)

    const store = useUsersStore()
    await store.fetchProfile()

    expect(store.currentUser).toEqual(mockProfile)
    expect(store.isLoading).toBe(false)
  })

  it('handles fetchProfile when response.data or user is undefined', async () => {
    vi.spyOn(userApi, 'getProfileApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: {}
    } as any)

    const store = useUsersStore()
    await store.fetchProfile()
    expect(store.currentUser).toBeNull()
  })

  it('resets isLoading when fetchProfile fails', async () => {
    vi.spyOn(userApi, 'getProfileApi').mockRejectedValue(new Error('Profile fetch failed'))
    const store = useUsersStore()

    await expect(store.fetchProfile()).rejects.toThrow('Profile fetch failed')
    expect(store.isLoading).toBe(false)
  })

  it('updates profile and sets currentUser from response', async () => {
    const updatedUser = { id: 2, name: 'Bob Updated', email: 'bob@delcom.org' }
    vi.spyOn(userApi, 'updateProfileApi').mockResolvedValue({
      status: 'success',
      message: 'Updated',
      data: { user: updatedUser }
    } as any)

    const store = useUsersStore()
    await store.updateProfile({ name: 'Bob Updated' })

    expect(store.currentUser).toEqual(updatedUser)
    expect(store.isUpdatingProfile).toBe(false)
  })

  it('keeps currentUser unchanged if response.data.user is missing on updateProfile', async () => {
    vi.spyOn(userApi, 'updateProfileApi').mockResolvedValue({
      status: 'success',
      message: 'Updated',
      data: {}
    } as any)

    const store = useUsersStore()
    store.currentUser = { id: 2, name: 'Bob', email: 'b@delcom.org' }
    await store.updateProfile({ name: 'Bob' })

    expect(store.currentUser.name).toBe('Bob')
  })

  it('resets isUpdatingProfile when updateProfile fails', async () => {
    vi.spyOn(userApi, 'updateProfileApi').mockRejectedValue(new Error('Update failed'))
    const store = useUsersStore()

    await expect(store.updateProfile({ name: 'Test' })).rejects.toThrow('Update failed')
    expect(store.isUpdatingProfile).toBe(false)
  })

  it('uploads photo and refreshes user profile', async () => {
    const uploadSpy = vi.spyOn(userApi, 'uploadPhotoApi').mockResolvedValue({
      status: 'success',
      message: 'Uploaded'
    })
    const fetchProfileSpy = vi.spyOn(userApi, 'getProfileApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: { user: { id: 1, name: 'User', email: 'u@test.com', photo: 'new.png' } }
    } as any)

    const store = useUsersStore()
    const file = new File(['dummy'], 'avatar.png', { type: 'image/png' })
    await store.uploadPhoto(file)

    expect(uploadSpy).toHaveBeenCalledWith(file)
    expect(fetchProfileSpy).toHaveBeenCalled()
    expect(store.isUploadingPhoto).toBe(false)
  })

  it('resets isUploadingPhoto when uploadPhoto fails', async () => {
    vi.spyOn(userApi, 'uploadPhotoApi').mockRejectedValue(new Error('Upload failed'))
    const store = useUsersStore()
    const file = new File(['dummy'], 'avatar.png', { type: 'image/png' })

    await expect(store.uploadPhoto(file)).rejects.toThrow('Upload failed')
    expect(store.isUploadingPhoto).toBe(false)
  })

  it('changes password successfully', async () => {
    vi.spyOn(userApi, 'changePasswordApi').mockResolvedValue({
      status: 'success',
      message: 'Password changed'
    })

    const store = useUsersStore()
    await store.changePassword({
      password: 'old',
      new_password: 'new',
      new_password_confirmation: 'new'
    })

    expect(store.isChangingPassword).toBe(false)
  })

  it('resets isChangingPassword when changePassword fails', async () => {
    vi.spyOn(userApi, 'changePasswordApi').mockRejectedValue(new Error('Change password failed'))
    const store = useUsersStore()

    await expect(store.changePassword({
      password: 'old',
      new_password: 'new',
      new_password_confirmation: 'new'
    })).rejects.toThrow('Change password failed')

    expect(store.isChangingPassword).toBe(false)
  })
})
