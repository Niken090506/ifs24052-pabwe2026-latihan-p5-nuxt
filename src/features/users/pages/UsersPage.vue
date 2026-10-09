<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Direktori Pengguna</h1>
        <p class="text-sm text-slate-500 mt-1">Daftar semua pengguna yang terdaftar di sistem Delcom Cash Flow.</p>
      </div>
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold self-start sm:self-auto">
        <span>Total Pengguna:</span>
        <span id="badge-total-users" class="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs">{{ filteredUsers.length }}</span>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
      <label for="search-users-input" class="sr-only">Cari Pengguna</label>
      <input
        id="search-users-input"
        type="search"
        placeholder="Cari berdasarkan nama atau email pengguna..."
        v-model="searchQuery"
        class="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.isLoading" class="py-12 text-center" role="status">
      <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-slate-500">Memuat data pengguna...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="py-12 bg-white rounded-2xl border border-slate-200 text-center">
      <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <span class="text-2xl font-bold">∅</span>
      </div>
      <h3 class="text-base font-semibold text-slate-800">Tidak ada pengguna ditemukan</h3>
      <p class="text-sm text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
    </div>

    <!-- Users Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4"
      >
        <img
          :src="user.photo || 'https://open-api.delcom.org/default/img/user.png'"
          :alt="'Foto profil ' + user.name"
          class="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 bg-slate-100 shrink-0"
          @error="handleImgError"
        />
        <div class="min-w-0 flex-1">
          <h2 class="text-base font-bold text-slate-900 truncate">{{ user.name }}</h2>
          <p class="text-xs text-slate-500 truncate mt-0.5">{{ user.email }}</p>
          <div class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Bergabung sejak:</span>
            <span class="font-medium text-slate-600">{{ formatDate(user.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/features/users/states/usersStore'
import { formatDate } from '@/helpers/toolsHelper'

const usersStore = useUsersStore()
const searchQuery = ref('')

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return usersStore.users
  return usersStore.users.filter((user) => {
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  })
})

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'https://open-api.delcom.org/default/img/user.png'
}

onMounted(() => {
  usersStore.fetchUsers()
})
</script>
