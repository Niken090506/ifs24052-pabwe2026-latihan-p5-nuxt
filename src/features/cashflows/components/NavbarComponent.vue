<template>
  <header class="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
    <!-- Brand / Mobile Toggle -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="$emit('toggle-sidebar')"
        id="btn-sidebar-toggle"
        class="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        aria-label="Buka navigasi samping"
      >
        <span class="text-xl font-bold">☰</span>
      </button>
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-black/5">
          DC
        </div>
        <div class="hidden sm:block">
          <span class="text-base font-bold text-slate-900 leading-none">Delcom Cash Flow</span>
          <span class="block text-[11px] text-slate-600 font-medium">Sistem Keuangan Mandiri</span>
        </div>
      </div>
    </div>

    <!-- User Profile & Action -->
    <div class="flex items-center gap-3 sm:gap-5">
      <!-- Session Badge -->
      <div class="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span id="session-status-text">Sesi Aktif</span>
      </div>

      <!-- User Info -->
      <div class="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-5">
        <div class="text-right hidden sm:block">
          <p id="navbar-user-name" class="text-sm font-bold text-slate-800 leading-tight">
            {{ displayName }}
          </p>
          <p id="navbar-user-email" class="text-xs text-slate-600">
            {{ displayEmail }}
          </p>
        </div>

        <img
          :src="avatarUrl"
          :alt="'Avatar ' + displayName"
          class="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 bg-slate-100"
          @error="handleImgError"
        />

        <!-- Logout Button -->
        <button
          type="button"
          @click="handleLogout"
          id="btn-navbar-logout"
          title="Keluar dari akun"
          aria-label="Tombol Keluar"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-800 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
        >
          <span>Keluar</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/states/authStore'
import { useUsersStore } from '@/features/users/states/usersStore'
import { showConfirmDialog, showSuccessDialog } from '@/helpers/toolsHelper'

defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const displayName = computed(() => {
  return usersStore.currentUser?.name || authStore.user?.name || 'Pengguna'
})

const displayEmail = computed(() => {
  return usersStore.currentUser?.email || authStore.user?.email || 'user@delcom.org'
})

const avatarUrl = computed(() => {
  return (
    usersStore.currentUser?.photo ||
    authStore.user?.photo ||
    'https://open-api.delcom.org/default/img/user.png'
  )
})

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'https://open-api.delcom.org/default/img/user.png'
}

async function handleLogout() {
  const confirmed = await showConfirmDialog(
    'Apakah Anda yakin ingin keluar dari sistem?',
    'Konfirmasi Keluar',
    'Ya, Keluar',
    'Batal'
  )
  if (!confirmed) return

  await authStore.logout()
  await showSuccessDialog('Anda telah berhasil keluar.', 'Sampai Jumpa')
  router.push('/auth/login')
}
</script>
