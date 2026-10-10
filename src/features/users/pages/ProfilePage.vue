<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Profil Saya</h1>
      <p class="text-sm text-slate-500 mt-1">Kelola informasi pribadi, foto avatar, dan keamanan kata sandi akun Anda.</p>
    </div>

    <!-- Profile Overview Card -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
      <div class="relative group">
        <img
          :src="usersStore.currentUser?.photo || 'https://open-api.delcom.org/default/img/user.png'"
          :alt="'Foto profil ' + (usersStore.currentUser?.name || 'Pengguna')"
          class="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md bg-slate-100"
          @error="handleImgError"
        />
        <label
          for="profile-photo-input"
          class="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-xs font-semibold"
        >
          <span>Ubah</span>
          <input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePhotoChange"
          />
        </label>
      </div>

      <div class="text-center sm:text-left flex-1 min-w-0">
        <h2 class="text-xl font-bold text-slate-900 truncate">{{ usersStore.currentUser?.name || 'Memuat Pengguna...' }}</h2>
        <p class="text-sm text-slate-500 mt-0.5 truncate">{{ usersStore.currentUser?.email || '-' }}</p>
        <div class="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            Akun Aktif
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
            Terdaftar: {{ formatDate(usersStore.currentUser?.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Edit Profile Form -->
      <section class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Ubah Data Diri</h3>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4" novalidate>
          <div>
            <label for="edit-profile-name" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="edit-profile-name"
              type="text"
              required
              :value="nameInput.value.value"
              @input="nameInput.onChange"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p v-if="nameInput.error.value" class="mt-1 text-xs text-rose-600">{{ nameInput.error.value }}</p>
          </div>

          <div>
            <label for="edit-profile-email" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <input
              id="edit-profile-email"
              type="email"
              disabled
              :value="usersStore.currentUser?.email || ''"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-slate-600">Email akun tidak dapat diubah secara langsung.</p>
          </div>

          <button
            type="submit"
            :disabled="usersStore.isUpdatingProfile"
            id="btn-save-profile"
            class="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="usersStore.isUpdatingProfile">Menyimpan...</span>
            <span v-else>Simpan Perubahan</span>
          </button>
        </form>
      </section>

      <!-- Change Password Form -->
      <section class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Ubah Kata Sandi</h3>
        <form @submit.prevent="handleChangePassword" class="space-y-4" novalidate>
          <div>
            <label for="current-password" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              id="current-password"
              type="password"
              required
              placeholder="••••••••"
              :value="oldPasswordInput.value.value"
              @input="oldPasswordInput.onChange"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p v-if="oldPasswordInput.error.value" class="mt-1 text-xs text-rose-600">{{ oldPasswordInput.error.value }}</p>
          </div>

          <div>
            <label for="new-password" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi Baru
            </label>
            <input
              id="new-password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              :value="newPasswordInput.value.value"
              @input="newPasswordInput.onChange"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p v-if="newPasswordInput.error.value" class="mt-1 text-xs text-rose-600">{{ newPasswordInput.error.value }}</p>
          </div>

          <div>
            <label for="confirm-new-password" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              id="confirm-new-password"
              type="password"
              required
              placeholder="Ulangi kata sandi baru"
              :value="confirmPasswordInput.value.value"
              @input="confirmPasswordInput.onChange"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p v-if="confirmPasswordInput.error.value" class="mt-1 text-xs text-rose-600">{{ confirmPasswordInput.error.value }}</p>
          </div>

          <button
            type="submit"
            :disabled="usersStore.isChangingPassword"
            id="btn-save-password"
            class="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="usersStore.isChangingPassword">Memperbarui Kata Sandi...</span>
            <span v-else>Perbarui Kata Sandi</span>
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useUsersStore } from '@/features/users/states/usersStore'
import { useInput } from '@/hooks/useInput'
import { formatDate, showSuccessDialog, showErrorDialog } from '@/helpers/toolsHelper'

const usersStore = useUsersStore()

const nameInput = useInput('')
const oldPasswordInput = useInput('')
const newPasswordInput = useInput('')
const confirmPasswordInput = useInput('')

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'https://open-api.delcom.org/default/img/user.png'
}

watch(
  () => usersStore.currentUser,
  (user) => {
    if (user && user.name) {
      nameInput.setValue(user.name)
    }
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    await usersStore.fetchProfile()
    if (usersStore.currentUser?.name) {
      nameInput.setValue(usersStore.currentUser.name)
    }
  } catch (error: any) {
    if (error?.status === 401 || error?.message?.includes('autentikasi')) {
      return
    }
    showErrorDialog(error.message || 'Gagal memuat profil pengguna')
  }
})

async function handlePhotoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    await usersStore.uploadPhoto(file)
    await showSuccessDialog('Foto profil berhasil diperbarui!')
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal mengunggah foto profil')
  } finally {
    target.value = ''
  }
}

async function handleUpdateProfile() {
  if (!nameInput.value.value.trim()) {
    nameInput.setError('Nama lengkap tidak boleh kosong')
    return
  }

  try {
    await usersStore.updateProfile({ name: nameInput.value.value.trim() })
    await showSuccessDialog('Profil berhasil diperbarui!')
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal memperbarui profil')
  }
}

async function handleChangePassword() {
  let hasError = false
  if (!oldPasswordInput.value.value) {
    oldPasswordInput.setError('Kata sandi saat ini wajib diisi')
    hasError = true
  }
  if (!newPasswordInput.value.value || newPasswordInput.value.value.length < 6) {
    newPasswordInput.setError('Kata sandi baru minimal 6 karakter')
    hasError = true
  }
  if (newPasswordInput.value.value !== confirmPasswordInput.value.value) {
    confirmPasswordInput.setError('Konfirmasi kata sandi tidak cocok')
    hasError = true
  }
  if (hasError) return

  try {
    await usersStore.changePassword({
      password: oldPasswordInput.value.value,
      new_password: newPasswordInput.value.value,
      new_password_confirmation: confirmPasswordInput.value.value
    })
    await showSuccessDialog('Kata sandi berhasil diubah!')
    oldPasswordInput.reset()
    newPasswordInput.reset()
    confirmPasswordInput.reset()
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal mengubah kata sandi')
  }
}
</script>
