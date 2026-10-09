import { describe, it, expect, vi } from 'vitest'
import * as apiHelper from '@/helpers/apiHelper'
import authApiDefault, { loginApi, registerApi, logoutApi } from './authApi'

describe('authApi', () => {
  it('calls /auth/login with POST method and payload', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { token: 'tok', user: { id: 1 } }
    } as any)

    const payload = { email: 'test@delcom.org', password: 'secretpassword' }
    const res = await loginApi(payload)

    expect(apiFetchSpy).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    expect(res.status).toBe('success')
  })

  it('calls /auth/register with POST method and payload', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Berhasil'
    } as any)

    const payload = { name: 'User', email: 'user@delcom.org', password: 'secretpassword' }
    const res = await registerApi(payload)

    expect(apiFetchSpy).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    expect(res.status).toBe('success')
  })

  it('calls /auth/logout with POST method', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Berhasil logout'
    } as any)

    const res = await logoutApi()

    expect(apiFetchSpy).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST'
    })
    expect(res.status).toBe('success')
  })

  it('checks default export', () => {
    expect(authApiDefault.loginApi).toBe(loginApi)
    expect(authApiDefault.registerApi).toBe(registerApi)
    expect(authApiDefault.logoutApi).toBe(logoutApi)
  })
})
