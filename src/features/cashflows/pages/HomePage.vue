<template>
  <div class="space-y-6">
    <!-- Header with Quick Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ringkasan Arus Kas
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Pantau seluruh aktivitas keuangan, aliran kas masuk, dan pengeluaran secara real-time.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="isAddModalOpen = true"
          id="btn-open-add-modal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <span>＋</span>
          <span>Catat Transaksi</span>
        </button>

        <button
          type="button"
          @click="handleDeleteAll"
          id="btn-delete-all-cashflows"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all cursor-pointer"
          title="Hapus semua riwayat catatan arus kas"
        >
          <span>🗑️</span>
          <span>Reset Semua</span>
        </button>
      </div>
    </div>

    <!-- Financial Metric Cards (6 cards) -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Ringkasan Saldo Finansial">
      <!-- Net Cash Flow -->
      <div class="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-indigo-300">Total Saldo Bersih</span>
          <span class="text-xs bg-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-200">Net</span>
        </div>
        <p id="metric-net-cashflow" class="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
          {{ formatRupiah(cashFlowsStore.netCashFlow) }}
        </p>
        <p class="text-xs text-indigo-200/70 mt-2">Selisih total inflow dan outflow</p>
      </div>

      <!-- Total Inflow -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600">Total Pemasukan</span>
          <span class="text-emerald-500 bg-emerald-50 text-xs px-2 py-0.5 rounded-full font-bold">Inflow</span>
        </div>
        <p id="metric-total-inflow" class="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-3 tracking-tight">
          {{ formatRupiah(cashFlowsStore.totalInflow) }}
        </p>
        <p class="text-xs text-slate-400 mt-2">Akumulasi seluruh kas masuk</p>
      </div>

      <!-- Total Outflow -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-rose-600">Total Pengeluaran</span>
          <span class="text-rose-500 bg-rose-50 text-xs px-2 py-0.5 rounded-full font-bold">Outflow</span>
        </div>
        <p id="metric-total-outflow" class="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-3 tracking-tight">
          {{ formatRupiah(cashFlowsStore.totalOutflow) }}
        </p>
        <p class="text-xs text-slate-400 mt-2">Akumulasi seluruh kas keluar</p>
      </div>

      <!-- Cash Balance -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Kas Tunai</span>
          <span class="text-slate-500 bg-slate-100 text-xs px-2 py-0.5 rounded-full font-medium">Cash</span>
        </div>
        <p id="metric-cash-balance" class="text-xl sm:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
          {{ formatRupiah(cashFlowsStore.cashBalance) }}
        </p>
        <p class="text-xs text-slate-400 mt-2">Saldo uang tunai di dompet</p>
      </div>

      <!-- Savings Balance -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-sky-600">Saldo Tabungan</span>
          <span class="text-sky-600 bg-sky-50 text-xs px-2 py-0.5 rounded-full font-medium">Savings</span>
        </div>
        <p id="metric-savings-balance" class="text-xl sm:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
          {{ formatRupiah(cashFlowsStore.savingsBalance) }}
        </p>
        <p class="text-xs text-slate-400 mt-2">Saldo rekening bank & simpanan</p>
      </div>

      <!-- Loans Balance -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-amber-600">Saldo Pinjaman</span>
          <span class="text-amber-600 bg-amber-50 text-xs px-2 py-0.5 rounded-full font-medium">Loans</span>
        </div>
        <p id="metric-loans-balance" class="text-xl sm:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
          {{ formatRupiah(cashFlowsStore.loansBalance) }}
        </p>
        <p class="text-xs text-slate-400 mt-2">Saldo dana hutang/pinjaman</p>
      </div>
    </section>

    <!-- Interactive Filters Bar -->
    <section class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4" aria-label="Filter Riwayat Arus Kas">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">Filter Transaksi</h2>
        <button
          type="button"
          @click="resetFilters"
          id="btn-reset-filters"
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          Bersihkan Filter
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <!-- Type Filter -->
        <div>
          <label for="filter-type" class="block text-xs font-semibold text-slate-600 mb-1">Jenis Kas</label>
          <select
            id="filter-type"
            v-model="filterType"
            @change="applyFilters"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Jenis</option>
            <option value="inflow">Pemasukan (Inflow)</option>
            <option value="outflow">Pengeluaran (Outflow)</option>
          </select>
        </div>

        <!-- Source Filter -->
        <div>
          <label for="filter-source" class="block text-xs font-semibold text-slate-600 mb-1">Sumber Dana</label>
          <select
            id="filter-source"
            v-model="filterSource"
            @change="applyFilters"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Sumber</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label Filter -->
        <div>
          <label for="filter-label" class="block text-xs font-semibold text-slate-600 mb-1">Label / Kategori</label>
          <input
            id="filter-label"
            type="text"
            placeholder="Cari label..."
            v-model="filterLabel"
            @input="applyFilters"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Start Date Filter -->
        <div>
          <label for="filter-start-date" class="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mulai</label>
          <input
            id="filter-start-date"
            type="date"
            v-model="filterStartDate"
            @change="applyFilters"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- End Date Filter -->
        <div>
          <label for="filter-end-date" class="block text-xs font-semibold text-slate-600 mb-1">Tanggal Akhir</label>
          <input
            id="filter-end-date"
            type="date"
            v-model="filterEndDate"
            @change="applyFilters"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </section>

    <!-- Cash Flows List / Table -->
    <section class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden" aria-label="Daftar Riwayat Catatan Transaksi">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">
          Riwayat Transaksi Arus Kas
        </h2>
        <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {{ cashFlowsStore.cashFlows.length }} Catatan
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="cashFlowsStore.isLoading" class="py-16 text-center" role="status">
        <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-3 text-sm text-slate-500">Memuat data arus kas...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="cashFlowsStore.cashFlows.length === 0" class="py-16 text-center">
        <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <span class="text-2xl font-bold">∅</span>
        </div>
        <h3 class="text-base font-semibold text-slate-800">Belum ada transaksi tercatat</h3>
        <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Mulai catat transaksi pemasukan atau pengeluaran Anda dengan menekan tombol "Catat Transaksi" di atas.
        </p>
      </div>

      <!-- Desktop Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse" id="table-cashflows">
          <thead>
            <tr class="bg-slate-50/75 border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th scope="col" class="py-3 px-4">Jenis</th>
              <th scope="col" class="py-3 px-4">Kategori / Label</th>
              <th scope="col" class="py-3 px-4">Sumber Dana</th>
              <th scope="col" class="py-3 px-4">Deskripsi</th>
              <th scope="col" class="py-3 px-4 text-right">Nominal</th>
              <th scope="col" class="py-3 px-4">Tanggal</th>
              <th scope="col" class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr
              v-for="item in cashFlowsStore.cashFlows"
              :key="item.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- Type Badge -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
                    item.type === 'inflow'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  ]"
                >
                  <span>{{ item.type === 'inflow' ? '↓ Pemasukan' : '↑ Pengeluaran' }}</span>
                </span>
              </td>

              <!-- Label -->
              <td class="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                  #{{ item.label }}
                </span>
              </td>

              <!-- Source -->
              <td class="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                <span v-if="item.source === 'cash'">💵 Tunai</span>
                <span v-else-if="item.source === 'savings'">🏦 Tabungan</span>
                <span v-else>💳 Pinjaman</span>
              </td>

              <!-- Description -->
              <td class="py-3.5 px-4 text-slate-600 max-w-xs truncate" :title="item.description">
                {{ item.description }}
              </td>

              <!-- Nominal -->
              <td
                class="py-3.5 px-4 text-right font-bold whitespace-nowrap"
                :class="item.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ item.type === 'inflow' ? '+' : '-' }} {{ formatRupiah(item.nominal) }}
              </td>

              <!-- Date -->
              <td class="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                {{ formatDateTime(item.created_at) }}
              </td>

              <!-- Quick Actions -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                  <RouterLink
                    :to="'/cash-flows/' + item.id"
                    :id="'btn-detail-' + item.id"
                    class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors"
                    title="Lihat Rincian Detail"
                    aria-label="Detail transaksi"
                  >
                    <span>👁️</span>
                  </RouterLink>

                  <button
                    type="button"
                    @click="openChangeModal(item)"
                    :id="'btn-edit-' + item.id"
                    class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-colors cursor-pointer"
                    title="Ubah Transaksi"
                    aria-label="Edit transaksi"
                  >
                    <span>✏️</span>
                  </button>

                  <button
                    type="button"
                    @click="handleDeleteItem(item.id)"
                    :id="'btn-delete-' + item.id"
                    class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                    title="Hapus Transaksi"
                    aria-label="Hapus transaksi"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modals -->
    <AddModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @success="fetchData"
    />

    <ChangeModal
      :is-open="isChangeModalOpen"
      :cash-flow="selectedCashFlow"
      @close="closeChangeModal"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import { formatRupiah, formatDateTime, showConfirmDialog, showSuccessDialog, showErrorDialog } from '@/helpers/toolsHelper'
import AddModal from '@/features/cashflows/modals/AddModal.vue'
import ChangeModal from '@/features/cashflows/modals/ChangeModal.vue'
import type { CashFlow } from '@/features/cashflows/api/cashFlowApi'

const cashFlowsStore = useCashFlowsStore()

const isAddModalOpen = ref(false)
const isChangeModalOpen = ref(false)
const selectedCashFlow = ref<CashFlow | null>(null)

const filterType = ref('')
const filterSource = ref('')
const filterLabel = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

async function fetchData() {
  const params: any = {}
  if (filterType.value) params.type = filterType.value
  if (filterSource.value) params.source = filterSource.value
  if (filterLabel.value.trim()) params.label = filterLabel.value.trim()
  if (filterStartDate.value) params.start_date = `${filterStartDate.value} 00:00:00`
  if (filterEndDate.value) params.end_date = `${filterEndDate.value} 23:59:59`

  try {
    await cashFlowsStore.fetchCashFlows(params)
    await cashFlowsStore.fetchLabels()
  } catch (error: any) {
    if (error?.status === 401 || error?.message?.includes('autentikasi')) {
      return
    }
    showErrorDialog(error.message || 'Gagal memuat catatan arus kas')
  }
}

function applyFilters() {
  fetchData()
}

function resetFilters() {
  filterType.value = ''
  filterSource.value = ''
  filterLabel.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  fetchData()
}

function openChangeModal(item: CashFlow) {
  selectedCashFlow.value = item
  isChangeModalOpen.value = true
}

function closeChangeModal() {
  selectedCashFlow.value = null
  isChangeModalOpen.value = false
}

async function handleDeleteItem(id: number) {
  const confirmed = await showConfirmDialog(
    `Apakah Anda yakin ingin menghapus catatan transaksi #${id}?`,
    'Konfirmasi Hapus'
  )
  if (!confirmed) return

  try {
    await cashFlowsStore.deleteCashFlow(id)
    await showSuccessDialog('Catatan transaksi berhasil dihapus!')
    fetchData()
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal menghapus transaksi')
  }
}

async function handleDeleteAll() {
  const confirmed = await showConfirmDialog(
    'PERINGATAN: Semua riwayat transaksi arus kas Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!',
    'Reset Seluruh Catatan?',
    'Ya, Reset Semua',
    'Batal'
  )
  if (!confirmed) return

  try {
    await cashFlowsStore.deleteAllCashFlows()
    await showSuccessDialog('Seluruh catatan arus kas berhasil direset!')
    fetchData()
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal mereset catatan arus kas')
  }
}

onMounted(() => {
  fetchData()
})
</script>
