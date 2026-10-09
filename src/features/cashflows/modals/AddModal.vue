<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-add-title"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 transition-all">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 id="modal-add-title" class="text-xl font-bold text-slate-900">
          Catat Transaksi Baru
        </h2>
        <button
          type="button"
          @click="$emit('close')"
          id="btn-close-add-modal"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
          aria-label="Tutup formulir tambah transaksi"
        >
          <span class="text-lg font-bold">✕</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4" novalidate>
        <!-- Type Selection -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">
            Jenis Transaksi
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="type = 'inflow'"
              id="btn-select-inflow"
              :class="[
                'py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all',
                type === 'inflow'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span>↓</span> Pemasukan (Inflow)
            </button>
            <button
              type="button"
              @click="type = 'outflow'"
              id="btn-select-outflow"
              :class="[
                'py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all',
                type === 'outflow'
                  ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span>↑</span> Pengeluaran (Outflow)
            </button>
          </div>
        </div>

        <!-- Source Selection -->
        <div>
          <label for="add-source-select" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Sumber Dana
          </label>
          <select
            id="add-source-select"
            v-model="source"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label / Category -->
        <div>
          <label for="add-label-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Kategori / Label
          </label>
          <input
            id="add-label-input"
            type="text"
            required
            placeholder="contoh: Gaji, Belanja, Transportasi"
            :value="labelInput.value.value"
            @input="labelInput.onChange"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="labelInput.error.value" class="mt-1 text-xs text-rose-600">{{ labelInput.error.value }}</p>
        </div>

        <!-- Nominal -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="add-nominal-input" class="block text-sm font-semibold text-slate-700">
              Nominal (Rupiah)
            </label>
            <span class="text-xs font-semibold text-indigo-600">
              {{ formatRupiah(nominalInput.value.value || 0) }}
            </span>
          </div>
          <input
            id="add-nominal-input"
            type="number"
            min="1"
            step="1"
            required
            placeholder="0"
            :value="nominalInput.value.value"
            @input="nominalInput.onChange"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="nominalInput.error.value" class="mt-1 text-xs text-rose-600">{{ nominalInput.error.value }}</p>
        </div>

        <!-- Description -->
        <div>
          <label for="add-description-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Keterangan Deskripsi
          </label>
          <textarea
            id="add-description-input"
            rows="3"
            required
            placeholder="Catatan tambahan mengenai transaksi ini..."
            :value="descInput.value.value"
            @input="descInput.onChange"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
          <p v-if="descInput.error.value" class="mt-1 text-xs text-rose-600">{{ descInput.error.value }}</p>
        </div>

        <!-- Modal Actions -->
        <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            @click="$emit('close')"
            id="btn-cancel-add"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="cashFlowsStore.isCashFlowAdd"
            id="btn-submit-add"
            class="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <span v-if="cashFlowsStore.isCashFlowAdd">Menyimpan...</span>
            <span v-else>Simpan Transaksi</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import { useInput } from '@/hooks/useInput'
import { formatRupiah, showSuccessDialog, showErrorDialog } from '@/helpers/toolsHelper'
import type { CashFlowType, CashFlowSource } from '@/features/cashflows/api/cashFlowApi'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const cashFlowsStore = useCashFlowsStore()

const type = ref<CashFlowType>('inflow')
const source = ref<CashFlowSource>('cash')
const labelInput = useInput('')
const nominalInput = useInput('')
const descInput = useInput('')

function resetForm() {
  type.value = 'inflow'
  source.value = 'cash'
  labelInput.reset()
  nominalInput.reset()
  descInput.reset()
}

async function handleSubmit() {
  let hasError = false

  if (!labelInput.value.value.trim()) {
    labelInput.setError('Kategori/label wajib diisi')
    hasError = true
  }

  const nominalVal = Number(nominalInput.value.value)
  if (!nominalInput.value.value || isNaN(nominalVal) || nominalVal <= 0) {
    nominalInput.setError('Nominal harus berupa angka lebih dari 0')
    hasError = true
  }

  if (!descInput.value.value.trim()) {
    descInput.setError('Deskripsi wajib diisi')
    hasError = true
  }

  if (hasError) return

  try {
    await cashFlowsStore.addCashFlow({
      type: type.value,
      source: source.value,
      label: labelInput.value.value.trim(),
      nominal: nominalVal,
      description: descInput.value.value.trim()
    })
    await showSuccessDialog('Transaksi arus kas berhasil dicatat!')
    resetForm()
    emit('success')
    emit('close')
  } catch (error: any) {
    await showErrorDialog(error.message || 'Gagal menyimpan transaksi arus kas')
  }
}
</script>
