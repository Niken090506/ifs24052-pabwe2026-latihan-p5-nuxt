import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia } from '@/test-utils'
import AddModal from './AddModal.vue'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('AddModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: false }
    })
    expect(wrapper.find('div[role="dialog"]').exists()).toBe(false)
  })

  it('renders modal form when isOpen is true', () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })
    expect(wrapper.find('div[role="dialog"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Catat Transaksi Baru')
  })

  it('displays loading state text when submitting', () => {
    const pinia = createMockPinia()
    const store = useCashFlowsStore(pinia)
    store.isCashFlowAdd = true

    const { wrapper } = renderWithProviders(AddModal, {
      pinia,
      props: { isOpen: true }
    })
    expect(wrapper.find('button#btn-submit-add').text()).toContain('Menyimpan...')
  })

  it('toggles transaction type between inflow and outflow', async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })

    const outflowBtn = wrapper.find('button#btn-select-outflow')
    await outflowBtn.trigger('click')
    expect(outflowBtn.classes()).toContain('border-rose-500')

    const inflowBtn = wrapper.find('button#btn-select-inflow')
    await inflowBtn.trigger('click')
    expect(inflowBtn.classes()).toContain('border-emerald-500')
  })

  it('validates required fields before submitting', async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })
    const cashFlowsStore = useCashFlowsStore()
    const addSpy = vi.spyOn(cashFlowsStore, 'addCashFlow')

    await wrapper.find('form').trigger('submit.prevent')

    expect(addSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Kategori/label wajib diisi')
    expect(wrapper.text()).toContain('Nominal harus berupa angka lebih dari 0')
    expect(wrapper.text()).toContain('Deskripsi wajib diisi')
  })

  it('submits form successfully, resets, and emits success and close', async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })
    const cashFlowsStore = useCashFlowsStore()
    const addSpy = vi.spyOn(cashFlowsStore, 'addCashFlow').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    await wrapper.find('select#add-source-select').setValue('savings')
    await wrapper.find('input#add-label-input').setValue('Tabungan Bulanan')
    await wrapper.find('input#add-nominal-input').setValue('2500000')
    await wrapper.find('textarea#add-description-input').setValue('Simpanan gaji')

    await wrapper.find('form').trigger('submit.prevent')

    expect(addSpy).toHaveBeenCalledWith({
      type: 'inflow',
      source: 'savings',
      label: 'Tabungan Bulanan',
      nominal: 2500000,
      description: 'Simpanan gaji'
    })
    expect(successSpy).toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows error dialog when addCashFlow fails', async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })
    const cashFlowsStore = useCashFlowsStore()
    vi.spyOn(cashFlowsStore, 'addCashFlow').mockRejectedValue(new Error('Gagal simpan'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('input#add-label-input').setValue('Test')
    await wrapper.find('input#add-nominal-input').setValue('1000')
    await wrapper.find('textarea#add-description-input').setValue('Test')

    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal simpan')
  })

  it('shows fallback error dialog when error has no message', async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })
    const cashFlowsStore = useCashFlowsStore()
    vi.spyOn(cashFlowsStore, 'addCashFlow').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('input#add-label-input').setValue('Test')
    await wrapper.find('input#add-nominal-input').setValue('1000')
    await wrapper.find('textarea#add-description-input').setValue('Test')

    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal menyimpan transaksi arus kas')
  })

  it('emits close event when cancel or close button is clicked', async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { isOpen: true }
    })

    await wrapper.find('button#btn-close-add-modal').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()

    await wrapper.find('button#btn-cancel-add').trigger('click')
    expect(wrapper.emitted('close')?.length).toBe(2)
  })
})
