<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Buat Akun Baru</h2>
      <p class="text-slate-600 text-sm mt-1">Daftar untuk mulai mengelola arus kas Anda dengan efisien.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
      <div>
        <label for="register-name" class="block text-sm font-semibold text-slate-700 mb-1.5">
          Nama Lengkap
        </label>
        <div class="relative">
          <input
            id="register-name"
            name="name"
            type="text"
            autocomplete="name"
            required
            placeholder="John Doe"
            :value="nameInput.value.value"
            @input="nameInput.onChange"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <p v-if="nameInput.error.value" class="mt-1 text-xs text-rose-600">{{ nameInput.error.value }}</p>
      </div>

      <div>
        <label for="register-email" class="block text-sm font-semibold text-slate-700 mb-1.5">
          Alamat Email
        </label>
        <div class="relative">
          <input
            id="register-email"
            name="email"
            type="email"
            autocomplete="email"
            required
            placeholder="nama@delcom.org"
            :value="emailInput.value.value"
            @input="emailInput.onChange"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <p v-if="emailInput.error.value" class="mt-1 text-xs text-rose-600">{{ emailInput.error.value }}</p>
      </div>

      <div>
        <label for="register-password" class="block text-sm font-semibold text-slate-700 mb-1.5">
          Kata Sandi
        </label>
        <div class="relative">
          <input
            id="register-password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            placeholder="Minimal 6 karakter"
            :value="passwordInput.value.value"
            @input="passwordInput.onChange"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <p v-if="passwordInput.error.value" class="mt-1 text-xs text-rose-600">{{ passwordInput.error.value }}</p>
      </div>

      <button
        type="submit"
        :disabled="authStore.isLoading"
        id="btn-register-submit"
        class="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        <span v-if="authStore.isLoading">Mendaftarkan Akun...</span>
        <span v-else>Daftar Akun</span>
      </button>
    </form>

    <div class="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
      <span>Sudah memiliki akun? </span>
      <RouterLink
        to="/auth/login"
        id="link-to-login"
        class="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        Masuk di Sini
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/features/auth/states/authStore'
import { useInput } from '@/hooks/useInput'
import { showErrorDialog, showSuccessDialog } from '@/helpers/toolsHelper'

const router = useRouter()
const authStore = useAuthStore()

const nameInput = useInput('')
const emailInput = useInput('')
const passwordInput = useInput('')

async function handleSubmit() {
  let hasError = false
  if (!nameInput.value.value.trim()) {
    nameInput.setError('Nama lengkap wajib diisi')
    hasError = true
  }
  if (!emailInput.value.value.trim()) {
    emailInput.setError('Email wajib diisi')
    hasError = true
  }
  if (!passwordInput.value.value) {
    passwordInput.setError('Kata sandi wajib diisi')
    hasError = true
  }
  if (hasError) return

  try {
    await authStore.register({
      name: nameInput.value.value.trim(),
      email: emailInput.value.value.trim(),
      password: passwordInput.value.value
    })
    await showSuccessDialog('Akun berhasil dibuat! Silakan masuk.', 'Registrasi Berhasil')
    router.push('/auth/login')
  } catch (error: any) {
    await showErrorDialog(error.message || 'Pendaftaran gagal. Silakan coba lagi.')
  }
}
</script>
