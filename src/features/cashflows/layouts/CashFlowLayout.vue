<template>
  <div class="min-h-screen bg-slate-50 flex flex-col antialiased">
    <!-- Navbar Component -->
    <NavbarComponent @toggle-sidebar="toggleSidebar" />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar Component -->
      <SidebarComponent
        :is-open="isSidebarOpen"
        @close-sidebar="isSidebarOpen = false"
      />

      <!-- Backdrop for mobile sidebar -->
      <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
        aria-hidden="true"
      ></div>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <slot>
          <RouterView />
        </slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarComponent from '@/features/cashflows/components/NavbarComponent.vue'
import SidebarComponent from '@/features/cashflows/components/SidebarComponent.vue'
import { useAuthStore } from '@/features/auth/states/authStore'
import { useUsersStore } from '@/features/users/states/usersStore'

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(async () => {
  authStore.initAuth()
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  try {
    await usersStore.fetchProfile()
  } catch {
    // If token invalid, logout
    authStore.logout()
    router.push('/auth/login')
  }
})
</script>
