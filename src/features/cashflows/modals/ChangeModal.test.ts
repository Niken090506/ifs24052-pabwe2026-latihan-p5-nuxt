import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia } from '@/test-utils'
import ChangeModal from './ChangeModal.vue'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('ChangeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const sampleCashFlow = {
    id: 10,
    user_id: 1,
    type: 'outflow' as const,
    source: 'cash' as const,
    label: 'makan',
    description: 'makan siang kantor',
    nominal: 35000,
    created_at: '',
    updated_at: ''
  }

  it('does not render when isOpen is false or cashFlow is null', () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: false, cashFlow: sampleCashFlow }
    })
    expect(wrapper.find('div[role="dialog"]').exists()).toBe(false)

    const { wrapper: wrapperNull } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: null }
    })
    expect(wrapperNull.find('div[role="dialog"]').exists()).toBe(false)
  })

  it('displays loading state text when submitting changes', () => {
    const pinia = createMockPinia()
    const store = useCashFlowsStore(pinia)
    store.isCashFlowChange = true

    const { wrapper } = renderWithProviders(ChangeModal, {
      pinia,
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })
    expect(wrapper.find('button#btn-submit-change').text()).toContain('Menyimpan Perubahan...')
  })

  it('handles empty nominal value in preview badge', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })
    await wrapper.find('input#edit-nominal-input').setValue('')
    expect(wrapper.text()).toMatch(/Rp\s?0/)
  })

  it('populates fields from cashFlow prop and allows updating type and fields', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })

    expect(wrapper.text()).toContain('Ubah Data Transaksi #10')
    expect((wrapper.find('input#edit-label-input').element as HTMLInputElement).value).toBe('makan')
    expect((wrapper.find('input#edit-nominal-input').element as HTMLInputElement).value).toBe('35000')

    await wrapper.find('button#btn-edit-select-inflow').trigger('click')
    await wrapper.find('button#btn-edit-select-outflow').trigger('click')
    await wrapper.find('select#edit-source-select').setValue('savings')
    await wrapper.find('input#edit-label-input').setValue('makan-update')
    await wrapper.find('input#edit-nominal-input').setValue('40000')
    await wrapper.find('textarea#edit-description-input').setValue('makan malam')
  })

  it('validates empty inputs on submit', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })
    const cashFlowsStore = useCashFlowsStore()
    const updateSpy = vi.spyOn(cashFlowsStore, 'updateCashFlow')

    await wrapper.find('input#edit-label-input').setValue('')
    await wrapper.find('input#edit-nominal-input').setValue('0')
    await wrapper.find('textarea#edit-description-input').setValue('')

    await wrapper.find('form').trigger('submit.prevent')

    expect(updateSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Kategori/label wajib diisi')
    expect(wrapper.text()).toContain('Nominal harus berupa angka lebih dari 0')
    expect(wrapper.text()).toContain('Deskripsi wajib diisi')
  })

  it('submits update successfully and emits success and close', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })
    const cashFlowsStore = useCashFlowsStore()
    const updateSpy = vi.spyOn(cashFlowsStore, 'updateCashFlow').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    await wrapper.find('form').trigger('submit.prevent')

    expect(updateSpy).toHaveBeenCalledWith(10, {
      type: 'outflow',
      source: 'cash',
      label: 'makan',
      nominal: 35000,
      description: 'makan siang kantor'
    })
    expect(successSpy).toHaveBeenCalledWith('Transaksi berhasil diperbarui!')
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows error dialog when updateCashFlow fails', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })
    const cashFlowsStore = useCashFlowsStore()
    vi.spyOn(cashFlowsStore, 'updateCashFlow').mockRejectedValue(new Error('Gagal update'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal update')
  })

  it('shows fallback error dialog when error has no message', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })
    const cashFlowsStore = useCashFlowsStore()
    vi.spyOn(cashFlowsStore, 'updateCashFlow').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith('Gagal mengubah transaksi arus kas')
  })

  it('returns early in handleSubmit when cashFlow prop is null', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: null }
    })
    const cashFlowsStore = useCashFlowsStore()
    const updateSpy = vi.spyOn(cashFlowsStore, 'updateCashFlow')

    // Invoke handleSubmit directly on component instance
    await (wrapper.vm as any).handleSubmit()
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('emits close event when close or cancel button is clicked', async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: sampleCashFlow }
    })

    await wrapper.find('button#btn-close-change-modal').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()

    await wrapper.find('button#btn-cancel-change').trigger('click')
    expect(wrapper.emitted('close')?.length).toBe(2)
  })
})
