import { describe, it, expect, vi } from 'vitest'
import * as apiHelper from '@/helpers/apiHelper'
import userApiDefault, {
  getUsersApi,
  getProfileApi,
  updateProfileApi,
  uploadPhotoApi,
  changePasswordApi
} from './userApi'

describe('userApi', () => {
  it('calls getUsersApi with GET /users', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { users: [] }
    } as any)

    const res = await getUsersApi()
    expect(apiFetchSpy).toHaveBeenCalledWith('/users')
    expect(res.status).toBe('success')
  })

  it('calls getProfileApi with GET /users/me', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { user: { id: 1 } }
    } as any)

    const res = await getProfileApi()
    expect(apiFetchSpy).toHaveBeenCalledWith('/users/me')
    expect(res.status).toBe('success')
  })

  it('calls updateProfileApi with PUT /users/me', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { user: { id: 1, name: 'Updated' } }
    } as any)

    const payload = { name: 'Updated', email: 'u@test.com' }
    const res = await updateProfileApi(payload)

    expect(apiFetchSpy).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    expect(res.status).toBe('success')
  })

  it('calls uploadPhotoApi with POST /users/me/photo and FormData', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Photo uploaded'
    } as any)

    const mockFile = new File(['dummy'], 'photo.png', { type: 'image/png' })
    const res = await uploadPhotoApi(mockFile)

    expect(apiFetchSpy).toHaveBeenCalledWith('/users/me/photo', {
      method: 'POST',
      body: expect.any(FormData)
    })
    expect(res.status).toBe('success')
  })

  it('calls changePasswordApi with PUT /users/password', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Password changed'
    } as any)

    const payload = {
      password: 'oldpass',
      new_password: 'newpass',
      new_password_confirmation: 'newpass'
    }
    const res = await changePasswordApi(payload)

    expect(apiFetchSpy).toHaveBeenCalledWith('/users/password', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    expect(res.status).toBe('success')
  })

  it('falls back to /users/me/password when /users/password returns 404', async () => {
    const notFoundError = new Error('Not found') as any
    notFoundError.status = 404

    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch')
      .mockRejectedValueOnce(notFoundError)
      .mockResolvedValueOnce({
        status: 'success',
        message: 'Password changed via fallback'
      } as any)

    const payload = {
      password: 'oldpass',
      new_password: 'newpass',
      new_password_confirmation: 'newpass'
    }
    const res = await changePasswordApi(payload)

    expect(apiFetchSpy).toHaveBeenNthCalledWith(1, '/users/password', expect.anything())
    expect(apiFetchSpy).toHaveBeenNthCalledWith(2, '/users/me/password', expect.anything())
    expect(res.message).toBe('Password changed via fallback')
  })

  it('rethrows error when changePasswordApi fails with non-404 error', async () => {
    const serverError = new Error('Server error') as any
    serverError.status = 500

    vi.spyOn(apiHelper, 'apiFetch').mockRejectedValue(serverError)

    const payload = {
      password: 'oldpass',
      new_password: 'newpass',
      new_password_confirmation: 'newpass'
    }
    await expect(changePasswordApi(payload)).rejects.toThrow('Server error')
  })

  it('checks default export', () => {
    expect(userApiDefault.getUsersApi).toBe(getUsersApi)
    expect(userApiDefault.getProfileApi).toBe(getProfileApi)
    expect(userApiDefault.updateProfileApi).toBe(updateProfileApi)
    expect(userApiDefault.uploadPhotoApi).toBe(uploadPhotoApi)
    expect(userApiDefault.changePasswordApi).toBe(changePasswordApi)
  })
})
