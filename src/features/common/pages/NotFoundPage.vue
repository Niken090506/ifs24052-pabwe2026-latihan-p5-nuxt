<template>
  <div class="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
    <div class="max-w-md w-full space-y-6">
      <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-5xl font-black">
        404
      </div>
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Halaman Tidak Ditemukan</h1>
        <p class="text-slate-400 text-sm mt-2">
          Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
      </div>
      <div>
        <RouterLink
          to="/"
          id="btn-back-home-404"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>← Kembali ke Dashboard</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
