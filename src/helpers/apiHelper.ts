const TOKEN_STORAGE_KEY = 'delcom_access_token'

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }
  return null
}

export function putAccessToken(token: string | null): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }
}

export function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.VITE_DELCOM_BASEURL) {
    return process.env.VITE_DELCOM_BASEURL
  }
  if (typeof process !== 'undefined' && process.env?.DELCOM_BASEURL) {
    return process.env.DELCOM_BASEURL
  }
  return 'https://open-api.delcom.org/api/v1'
}

export interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl().replace(/\/+$/, '')
  let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}/${endpoint.replace(/^\/+/, '')}`

  if (options.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  const headers = new Headers(options.headers || {})

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const token = getAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response) {
    throw new Error('Gagal menghubungi server')
  }

  let responseData: any = null
  const contentType = response.headers?.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json()
    } catch {
      responseData = null
    }
  } else {
    try {
      responseData = await response.text()
    } catch {
      responseData = null
    }
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && typeof responseData === 'object' && (responseData.message || responseData.error)) ||
      `Permintaan gagal dengan status ${response.status}`
    const error = new Error(errorMessage) as any
    error.status = response.status
    error.data = responseData
    throw error
  }

  if (responseData && typeof responseData === 'object' && responseData.status === 'fail') {
    const error = new Error(responseData.message || 'Terjadi kesalahan pada respon server') as any
    error.data = responseData
    throw error
  }

  return responseData as T
}

export default {
  getAccessToken,
  putAccessToken,
  getBaseUrl,
  apiFetch
}
