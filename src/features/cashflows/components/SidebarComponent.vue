<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
    aria-label="Navigasi Utama Samping"
  >
    <!-- Brand / Close Mobile Button -->
    <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
          DC
        </div>
        <span class="font-bold text-white text-base tracking-tight">Delcom Cash Flow</span>
      </div>
      <button
        type="button"
        @click="$emit('close-sidebar')"
        class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
        aria-label="Tutup navigasi samping"
      >
        <span class="text-lg font-bold">✕</span>
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Menu Aplikasi">
      <RouterLink
        to="/"
        @click="$emit('close-sidebar')"
        id="nav-link-cashflow"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150"
        :class="isActive('/') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
      >
        <span class="w-5 text-center font-bold text-base">📊</span>
        <span>Ringkasan Arus Kas</span>
      </RouterLink>

      <RouterLink
        to="/users"
        @click="$emit('close-sidebar')"
        id="nav-link-users"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150"
        :class="isActive('/users') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
      >
        <span class="w-5 text-center font-bold text-base">👥</span>
        <span>Direktori Pengguna</span>
      </RouterLink>

      <RouterLink
        to="/profile"
        @click="$emit('close-sidebar')"
        id="nav-link-profile"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150"
        :class="isActive('/profile') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
      >
        <span class="w-5 text-center font-bold text-base">⚙️</span>
        <span>Profil Saya</span>
      </RouterLink>
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-slate-800 text-xs text-slate-500">
      <p class="font-medium text-slate-400">Delcom Open API v1.0</p>
      <p class="mt-0.5">Nuxt 4 & Tailwind CSS v4</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close-sidebar'): void
}>()

const route = useRoute()

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/' || route.path.startsWith('/cash-flows')
  }
  return route.path.startsWith(path)
}
</script>
