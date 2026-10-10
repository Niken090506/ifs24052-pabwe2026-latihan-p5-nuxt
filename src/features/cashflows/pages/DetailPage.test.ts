import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import DetailPage from './DetailPage.vue'
import ChangeModal from '@/features/cashflows/modals/ChangeModal.vue'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('DetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading indicator when store is loading', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.isLoading = true
      return new Promise(() => {})
    })
    cashFlowsStore.isLoading = true

    const { wrapper } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/1'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Memuat rincian transaksi...')
  })

  it('renders not found state when cash flow is missing', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.cashFlow = null
      return {} as any
    })
    cashFlowsStore.cashFlow = null

    const { wrapper } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/999'
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Catatan transaksi tidak ditemukan')
  })

  it('renders complete cash flow detail card with formatted values', async () => {
    const mockDetail = {
      id: 12,
      user_id: 1,
      type: 'inflow' as const,
      source: 'cash' as const,
      label: 'Gaji Bulanan',
      description: 'Gaji pokok bulan Oktober',
      nominal: 7500000,
      created_at: '2024-10-05T10:00:00Z',
      updated_at: '2024-10-05T10:00:00Z'
    }

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.cashFlow = mockDetail as any
      return {} as any
    })
    cashFlowsStore.cashFlow = mockDetail as any

    const { wrapper, router } = renderWithProviders(DetailPage, { pinia })
    await router.push('/cash-flows/12')
    await flushPromises()

    expect(wrapper.find('#detail-nominal-text').text()).toContain('+')
    expect(wrapper.find('#detail-label').text()).toContain('#Gaji Bulanan')
    expect(wrapper.find('#detail-source').text()).toContain('Kas Tunai (Cash)')
    expect(wrapper.find('#detail-description').text()).toContain('Gaji pokok bulan Oktober')
  })

  it('opens change modal on edit button click', async () => {
    const mockDetail = {
      id: 12,
      user_id: 1,
      type: 'inflow' as const,
      source: 'cash' as const,
      label: 'Gaji',
      description: 'Deskripsi',
      nominal: 100,
      created_at: '',
      updated_at: ''
    }

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.cashFlow = mockDetail as any
      return {} as any
    })
    cashFlowsStore.cashFlow = mockDetail as any

    const { wrapper } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/12'
    })
    await flushPromises()

    await wrapper.find('#btn-detail-edit').trigger('click')
    await flushPromises()
    expect(wrapper.find('#modal-change-title').exists()).toBe(true)

    const changeModal = wrapper.findComponent(ChangeModal)
    changeModal.vm.$emit('close')
    await flushPromises()
    expect(wrapper.find('#modal-change-title').exists()).toBe(false)

    changeModal.vm.$emit('success')
    await flushPromises()
  })

  it('handles item delete successfully and navigates back to home', async () => {
    const mockDetail = {
      id: 12,
      user_id: 1,
      type: 'outflow' as const,
      source: 'savings' as const,
      label: 'Alat',
      description: '',
      nominal: 50,
      created_at: '',
      updated_at: ''
    }

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.cashFlow = mockDetail as any
      return {} as any
    })
    cashFlowsStore.cashFlow = mockDetail as any

    const { wrapper, router } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/12'
    })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    const deleteSpy = vi.spyOn(cashFlowsStore, 'deleteCashFlow').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()
    const routerPushSpy = vi.spyOn(router, 'push')

    await wrapper.find('#btn-detail-delete').trigger('click')
    await flushPromises()

    expect(deleteSpy).toHaveBeenCalledWith(12)
    expect(successSpy).toHaveBeenCalledWith('Catatan transaksi berhasil dihapus!')
    expect(routerPushSpy).toHaveBeenCalledWith('/')
  })

  it('cancels deletion when dialog dismissed', async () => {
    const mockDetail = {
      id: 12,
      user_id: 1,
      type: 'outflow' as const,
      source: 'loans' as const,
      label: 'Hutang',
      description: '',
      nominal: 10,
      created_at: '',
      updated_at: ''
    }

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.cashFlow = mockDetail as any
      return {} as any
    })
    cashFlowsStore.cashFlow = mockDetail as any

    const { wrapper } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/12'
    })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(false)
    const deleteSpy = vi.spyOn(cashFlowsStore, 'deleteCashFlow')

    await wrapper.find('#btn-detail-delete').trigger('click')
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('handles fetchDetail error on mount', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockRejectedValue(new Error('Detail fetch error'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { router } = renderWithProviders(DetailPage, { pinia })
    await router.push('/cash-flows/99')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Detail fetch error')
  })

  it('handles delete failure error', async () => {
    const mockDetail = {
      id: 15,
      user_id: 1,
      type: 'outflow' as const,
      source: 'cash' as const,
      label: 'Ops',
      description: '',
      nominal: 50,
      created_at: '',
      updated_at: ''
    }

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockImplementation(async () => {
      cashFlowsStore.cashFlow = mockDetail as any
      return {} as any
    })
    cashFlowsStore.cashFlow = mockDetail as any

    const { wrapper } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/15'
    })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(cashFlowsStore, 'deleteCashFlow').mockRejectedValue(new Error('Gagal delete'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('#btn-detail-delete').trigger('click')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal delete')
  })

  it('skips fetchDetail when cashFlowId is empty', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    const fetchSpy = vi.spyOn(cashFlowsStore, 'fetchCashFlowById')

    renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/'
    })
    await flushPromises()

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('shows fallback error dialog when fetchDetail error has no message', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { router } = renderWithProviders(DetailPage, { pinia })
    await router.push('/cash-flows/99')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal memuat rincian transaksi')
  })

  it('shows fallback error dialog when delete error has no message', async () => {
    const mockDetail = { id: 15, nominal: 50 }
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    cashFlowsStore.cashFlow = mockDetail as any

    const { wrapper } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/15'
    })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(cashFlowsStore, 'deleteCashFlow').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('#btn-detail-delete').trigger('click')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal menghapus transaksi')
  })

  it('returns early in handleDelete when cashFlow is null', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    cashFlowsStore.cashFlow = null

    const { wrapper } = renderWithProviders(DetailPage, { pinia })
    const confirmSpy = vi.spyOn(toolsHelper, 'showConfirmDialog')

    await (wrapper.vm as any).handleDelete()
    expect(confirmSpy).not.toHaveBeenCalled()
  })

  it('handles route change to a path without cashFlowId', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    const fetchSpy = vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockResolvedValue({} as any)

    const { router } = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: '/cash-flows/10'
    })
    await router.push('/')
    await flushPromises()

    expect(fetchSpy).not.toHaveBeenCalledWith('')
  })

  it('silently ignores 401 unauthenticated error when fetchDetail fails', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    const authErr = new Error('Belum melakukan autentikasi') as any
    authErr.status = 401
    vi.spyOn(cashFlowsStore, 'fetchCashFlowById').mockRejectedValue(authErr)
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    const { router } = renderWithProviders(DetailPage, { pinia })
    await router.push('/cash-flows/99')
    await flushPromises()

    expect(errorSpy).not.toHaveBeenCalled()
  })
})
