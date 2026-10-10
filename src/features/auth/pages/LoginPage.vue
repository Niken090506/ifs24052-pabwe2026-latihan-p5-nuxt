<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
      <p class="text-slate-600 text-sm mt-1">Masukkan kredensial akun Anda untuk mengakses dashboard.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
      <div>
        <label for="login-email-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
          Alamat Email
        </label>
        <div class="relative">
          <input
            id="login-email-input"
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
        <label for="login-password-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
          Kata Sandi
        </label>
        <div class="relative">
          <input
            id="login-password-input"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
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
        id="login-submit-button"
        class="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        <span v-if="authStore.isLoading">Memproses Masuk...</span>
        <span v-else>Masuk ke Akun</span>
      </button>
    </form>

    <div class="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
      <span>Belum memiliki akun? </span>
      <RouterLink
        to="/auth/register"
        id="link-to-register"
        class="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        Daftar Sekarang
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

const emailInput = useInput('')
const passwordInput = useInput('')

async function handleSubmit() {
  let hasError = false
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
    await authStore.login({
      email: emailInput.value.value.trim(),
      password: passwordInput.value.value
    })
    await showSuccessDialog('Berhasil masuk ke sistem!', 'Selamat Datang')
    router.push('/')
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal masuk, periksa email dan kata sandi Anda.')
  }
}
</script>
