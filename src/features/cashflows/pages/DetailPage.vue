<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Back Navigation -->
    <div class="flex items-center justify-between">
      <RouterLink
        to="/"
        id="btn-back-to-home"
        class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <span>← Kembali ke Ringkasan</span>
      </RouterLink>

      <div class="flex items-center gap-2" v-if="cashFlow">
        <button
          type="button"
          @click="isChangeModalOpen = true"
          id="btn-detail-edit"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
        >
          <span>✏️</span>
          <span>Ubah</span>
        </button>

        <button
          type="button"
          @click="handleDelete"
          id="btn-detail-delete"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
        >
          <span>🗑️</span>
          <span>Hapus</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cashFlowsStore.isLoading" class="py-20 text-center bg-white rounded-2xl border border-slate-200" role="status">
      <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-slate-500">Memuat rincian transaksi...</p>
    </div>

    <!-- Empty / Not Found State -->
    <div v-else-if="!cashFlow" class="py-20 text-center bg-white rounded-2xl border border-slate-200">
      <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <span class="text-2xl font-bold">?</span>
      </div>
      <h2 class="text-lg font-bold text-slate-800">Catatan transaksi tidak ditemukan</h2>
      <p class="text-sm text-slate-500 mt-1">Data mungkin telah dihapus atau ID tidak valid.</p>
    </div>

    <!-- Detail Card -->
    <article v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <!-- Card Header with Type Badge & Nominal -->
      <div
        :class="[
          'p-6 sm:p-8 border-b',
          cashFlow.type === 'inflow'
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-100'
            : 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-100'
        ]"
      >
        <div class="flex items-center justify-between gap-4">
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
              cashFlow.type === 'inflow'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            ]"
          >
            <span>{{ cashFlow.type === 'inflow' ? '↓ Pemasukan' : '↑ Pengeluaran' }}</span>
          </span>
          <span class="text-xs font-mono text-slate-600">ID: #{{ cashFlow.id }}</span>
        </div>

        <h1
          id="detail-nominal-text"
          class="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight"
          :class="cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'"
        >
          {{ cashFlow.type === 'inflow' ? '+' : '-' }} {{ formatRupiah(cashFlow.nominal) }}
        </h1>
        <p class="text-xs text-slate-600 mt-1">Nominal transaksi tercatat</p>
      </div>

      <!-- Information List -->
      <div class="p-6 sm:p-8 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-600">Kategori / Label</h3>
            <div class="mt-1">
              <span id="detail-label" class="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold font-mono">
                #{{ cashFlow.label }}
              </span>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-600">Sumber Dana</h3>
            <p id="detail-source" class="mt-1 text-sm font-semibold text-slate-800">
              <span v-if="cashFlow.source === 'cash'">💵 Kas Tunai (Cash)</span>
              <span v-else-if="cashFlow.source === 'savings'">🏦 Rekening Tabungan (Savings)</span>
              <span v-else>💳 Pinjaman / Hutang (Loans)</span>
            </p>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-600">Deskripsi Catatan</h3>
          <p id="detail-description" class="mt-2 text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
            {{ cashFlow.description }}
          </p>
        </div>

        <div class="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <span class="block text-slate-600 font-medium">Waktu Dibuat:</span>
            <span id="detail-created-at" class="font-semibold text-slate-700 mt-0.5 block">
              {{ formatDateTime(cashFlow.created_at) }}
            </span>
          </div>
          <div>
            <span class="block text-slate-600 font-medium">Terakhir Diperbarui:</span>
            <span id="detail-updated-at" class="font-semibold text-slate-700 mt-0.5 block">
              {{ formatDateTime(cashFlow.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </article>

    <!-- Change Modal -->
    <ChangeModal
      :is-open="isChangeModalOpen"
      :cash-flow="cashFlow"
      @close="isChangeModalOpen = false"
      @success="fetchDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import { formatRupiah, formatDateTime, showConfirmDialog, showSuccessDialog, showErrorDialog } from '@/helpers/toolsHelper'
import ChangeModal from '@/features/cashflows/modals/ChangeModal.vue'

const route = useRoute()
const router = useRouter()
const cashFlowsStore = useCashFlowsStore()

const isChangeModalOpen = ref(false)

const cashFlowId = computed(() => route.params.cashFlowId as string)
const cashFlow = computed(() => cashFlowsStore.cashFlow)

async function fetchDetail() {
  if (!cashFlowId.value) return
  try {
    await cashFlowsStore.fetchCashFlowById(cashFlowId.value)
  } catch (error: any) {
    if (error?.status === 401 || error?.message?.includes('autentikasi')) {
      return
    }
    await showErrorDialog(error.message || 'Gagal memuat rincian transaksi')
  }
}

async function handleDelete() {
  if (!cashFlow.value) return
  const confirmed = await showConfirmDialog(
    `Apakah Anda yakin ingin menghapus transaksi #${cashFlow.value.id}?`,
    'Konfirmasi Hapus'
  )
  if (!confirmed) return

  try {
    await cashFlowsStore.deleteCashFlow(cashFlow.value.id)
    await showSuccessDialog('Catatan transaksi berhasil dihapus!')
    router.push('/')
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal menghapus transaksi')
  }
}

watch(
  () => route.params.cashFlowId,
  () => {
    fetchDetail()
  }
)

onMounted(() => {
  fetchDetail()
})
</script>
