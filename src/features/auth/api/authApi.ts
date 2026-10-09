import { apiFetch } from '@/helpers/apiHelper'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  photo?: string | null
  created_at?: string
  updated_at?: string
}

export interface LoginResponse {
  status: string
  message: string
  data: {
    user: AuthUser
    token: string
  }
}

export interface RegisterResponse {
  status: string
  message: string
  data?: any
}

export interface LogoutResponse {
  status: string
  message: string
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  return await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
  return await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function logoutApi(): Promise<LogoutResponse> {
  return await apiFetch<LogoutResponse>('/auth/logout', {
    method: 'POST'
  })
}

export default {
  loginApi,
  registerApi,
  logoutApi
}
