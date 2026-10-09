import { defineStore } from 'pinia'
import {
  getUsersApi,
  getProfileApi,
  updateProfileApi,
  uploadPhotoApi,
  changePasswordApi,
  type UserItem,
  type UserProfile,
  type UpdateProfilePayload,
  type ChangePasswordPayload
} from '@/features/users/api/userApi'

export interface UsersState {
  users: UserItem[]
  currentUser: UserProfile | null
  isLoading: boolean
  isUpdatingProfile: boolean
  isUploadingPhoto: boolean
  isChangingPassword: boolean
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    isLoading: false,
    isUpdatingProfile: false,
    isUploadingPhoto: false,
    isChangingPassword: false
  }),

  actions: {
    setCurrentUser(user: UserProfile | null) {
      this.currentUser = user
    },

    async fetchUsers() {
      this.isLoading = true
      try {
        const response = await getUsersApi()
        this.users = response.data?.users || []
        return response
      } finally {
        this.isLoading = false
      }
    },

    async fetchProfile() {
      this.isLoading = true
      try {
        const response = await getProfileApi()
        this.currentUser = response.data?.user || null
        return response
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(payload: UpdateProfilePayload) {
      this.isUpdatingProfile = true
      try {
        const response = await updateProfileApi(payload)
        if (response.data?.user) {
          this.currentUser = response.data.user
        }
        return response
      } finally {
        this.isUpdatingProfile = false
      }
    },

    async uploadPhoto(photoFile: File) {
      this.isUploadingPhoto = true
      try {
        const response = await uploadPhotoApi(photoFile)
        await this.fetchProfile()
        return response
      } finally {
        this.isUploadingPhoto = false
      }
    },

    async changePassword(payload: ChangePasswordPayload) {
      this.isChangingPassword = true
      try {
        const response = await changePasswordApi(payload)
        return response
      } finally {
        this.isChangingPassword = false
      }
    }
  }
})
