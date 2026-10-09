import { apiFetch } from '@/helpers/apiHelper'

export interface UserItem {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  photo?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserProfile extends UserItem {}

export interface UsersResponse {
  status: string
  message: string
  data: {
    users: UserItem[]
  }
}

export interface ProfileResponse {
  status: string
  message: string
  data: {
    user: UserProfile
  }
}

export interface UpdateProfilePayload {
  name: string
  email?: string
}

export interface ChangePasswordPayload {
  password: string
  new_password: string
  new_password_confirmation: string
}

export interface ActionResponse {
  status: string
  message: string
  data?: any
}

export async function getUsersApi(): Promise<UsersResponse> {
  return await apiFetch<UsersResponse>('/users')
}

export async function getProfileApi(): Promise<ProfileResponse> {
  return await apiFetch<ProfileResponse>('/users/me')
}

export async function updateProfileApi(payload: UpdateProfilePayload): Promise<ProfileResponse> {
  return await apiFetch<ProfileResponse>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export async function uploadPhotoApi(photoFile: File): Promise<ActionResponse> {
  const formData = new FormData()
  formData.append('photo', photoFile)

  return await apiFetch<ActionResponse>('/users/me/photo', {
    method: 'POST',
    body: formData
  })
}

export async function changePasswordApi(payload: ChangePasswordPayload): Promise<ActionResponse> {
  try {
    return await apiFetch<ActionResponse>('/users/password', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  } catch (error: any) {
    // Fallback to /users/me/password in case API router maps it differently
    if (error?.status === 404) {
      return await apiFetch<ActionResponse>('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    }
    throw error
  }
}

export default {
  getUsersApi,
  getProfileApi,
  updateProfileApi,
  uploadPhotoApi,
  changePasswordApi
}
