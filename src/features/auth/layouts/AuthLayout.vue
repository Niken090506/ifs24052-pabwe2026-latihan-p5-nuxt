<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
    <!-- Decorative background glow -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

    <main class="w-full max-w-md relative z-10">
      <!-- Brand Header -->
      <header class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-lg shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
          <span class="text-white font-bold text-2xl tracking-wider">DC</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight">Delcom Cash Flow</h1>
        <p class="text-slate-400 text-sm mt-1">Platform Manajemen Keuangan & Arus Kas Pribadi</p>
      </header>

      <!-- Card Container -->
      <section class="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
        <slot>
          <RouterView />
        </slot>
      </section>

      <!-- Footer Info -->
      <footer class="mt-8 text-center text-xs text-slate-400">
        <p>&copy; 2026 Delcom Cash Flow. Dilindungi Hak Cipta.</p>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
