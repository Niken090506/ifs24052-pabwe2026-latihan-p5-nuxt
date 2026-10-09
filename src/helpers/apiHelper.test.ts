import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import apiHelperDefault, {
  getAccessToken,
  putAccessToken,
  getBaseUrl,
  apiFetch
} from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('token utilities', () => {
    it('returns null when no token is in localStorage', () => {
      expect(getAccessToken()).toBeNull()
    })

    it('saves and retrieves token from localStorage', () => {
      putAccessToken('sample-token-123')
      expect(getAccessToken()).toBe('sample-token-123')
    })

    it('removes token when putAccessToken is called with null', () => {
      putAccessToken('sample-token-123')
      putAccessToken(null)
      expect(getAccessToken()).toBeNull()
    })

    it('handles environment where window or localStorage is undefined', () => {
      const originalWindow = globalThis.window
      // @ts-ignore
      delete globalThis.window
      expect(getAccessToken()).toBeNull()
      expect(() => putAccessToken('token')).not.toThrow()
      globalThis.window = originalWindow
    })
  })

  describe('getBaseUrl', () => {
    it('returns default or environment baseUrl', () => {
      const originalVite = process.env.VITE_DELCOM_BASEURL
      const originalDelcom = process.env.DELCOM_BASEURL

      delete process.env.VITE_DELCOM_BASEURL
      delete process.env.DELCOM_BASEURL
      expect(getBaseUrl()).toBe('https://open-api.delcom.org/api/v1')

      process.env.DELCOM_BASEURL = 'https://fallback.delcom.org'
      expect(getBaseUrl()).toBe('https://fallback.delcom.org')

      process.env.VITE_DELCOM_BASEURL = 'https://custom.delcom.org'
      expect(getBaseUrl()).toBe('https://custom.delcom.org')

      process.env.VITE_DELCOM_BASEURL = originalVite
      process.env.DELCOM_BASEURL = originalDelcom
    })
  })

  describe('apiFetch', () => {
    it('performs successful GET request and returns JSON', async () => {
      const mockData = { status: 'success', data: { test: 1 } }
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      } as any)

      const result = await apiFetch('/test-endpoint')
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      )
    })

    it('throws error when fetch returns null response', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue(null as any)
      await expect(apiFetch('/null-res')).rejects.toThrow('Gagal menghubungi server')
    })

    it('appends query parameters correctly and skips null/undefined/empty', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'success' })
      } as any)

      await apiFetch('/filter?existing=1', {
        params: {
          type: 'inflow',
          count: 10,
          empty: '',
          nil: null,
          undef: undefined
        }
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/filter?existing=1&type=inflow&count=10'),
        expect.anything()
      )

      await apiFetch('/clean-endpoint', {
        params: { key: 'val' }
      })
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/clean-endpoint?key=val'),
        expect.anything()
      )
    })

    it('supports absolute URLs without prepending BaseURL', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'success' })
      } as any)

      await apiFetch('https://example.com/api/test')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/test',
        expect.anything()
      )
    })

    it('automatically attaches Bearer token if token exists and preserves custom auth', async () => {
      putAccessToken('my-secret-token')

      ;(global as any).fetch = vi.fn().mockImplementation(async (url, init) => {
        const headers = init.headers as Headers
        expect(headers.get('Authorization')).toBe('Bearer my-secret-token')
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' })
        } as any
      })

      await apiFetch('/protected')

      // Preserves existing Authorization
      ;(global as any).fetch = vi.fn().mockImplementation(async (url, init) => {
        const headers = init.headers as Headers
        expect(headers.get('Authorization')).toBe('Bearer custom-override')
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' })
        } as any
      })

      await apiFetch('/custom-auth', {
        headers: { Authorization: 'Bearer custom-override' }
      })
    })

    it('sets Content-Type to application/json for non-FormData body', async () => {
      ;(global as any).fetch = vi.fn().mockImplementation(async (url, init) => {
        const headers = init.headers as Headers
        expect(headers.get('Content-Type')).toBe('application/json')
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' })
        } as any
      })

      await apiFetch('/post', {
        method: 'POST',
        body: JSON.stringify({ hello: 'world' })
      })
    })

    it('does not overwrite Content-Type when body is FormData', async () => {
      const formData = new FormData()
      formData.append('file', 'test')

      ;(global as any).fetch = vi.fn().mockImplementation(async (url, init) => {
        const headers = init.headers as Headers
        expect(headers.has('Content-Type')).toBe(false)
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' })
        } as any
      })

      await apiFetch('/upload', {
        method: 'POST',
        body: formData
      })
    })

    it('handles non-JSON response text', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'OK response'
      } as any)

      const res = await apiFetch('/text-endpoint')
      expect(res).toBe('OK response')
    })

    it('handles json parse error gracefully', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => {
          throw new Error('Invalid JSON')
        }
      } as any)

      const res = await apiFetch('/broken-json')
      expect(res).toBeNull()
    })

    it('handles text parse error gracefully when non-json', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => {
          throw new Error('Cannot read text')
        }
      } as any)

      const res = await apiFetch('/broken-text')
      expect(res).toBeNull()
    })

    it('throws error when response.ok is false with responseData message', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'fail', message: 'Kredensial salah' })
      } as any)

      await expect(apiFetch('/bad-request')).rejects.toThrow('Kredensial salah')
    })

    it('throws error when response.ok is false with responseData error property', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Unauthorized token' })
      } as any)

      await expect(apiFetch('/unauthorized')).rejects.toThrow('Unauthorized token')
    })

    it('throws error when response.ok is false with fallback message', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => 'Internal Server Error'
      } as any)

      await expect(apiFetch('/server-error')).rejects.toThrow('Permintaan gagal dengan status 500')
    })

    it('throws error when responseData.status is fail', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'fail', message: 'Validasi gagal' })
      } as any)

      await expect(apiFetch('/validate')).rejects.toThrow('Validasi gagal')
    })

    it('throws error when responseData.status is fail without explicit message', async () => {
      ;(global as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'fail' })
      } as any)

      await expect(apiFetch('/fail-no-msg')).rejects.toThrow('Terjadi kesalahan pada respon server')
    })

    it('checks default export', () => {
      expect(apiHelperDefault.apiFetch).toBe(apiFetch)
      expect(apiHelperDefault.getAccessToken).toBe(getAccessToken)
      expect(apiHelperDefault.putAccessToken).toBe(putAccessToken)
      expect(apiHelperDefault.getBaseUrl).toBe(getBaseUrl)
    })
  })
})
