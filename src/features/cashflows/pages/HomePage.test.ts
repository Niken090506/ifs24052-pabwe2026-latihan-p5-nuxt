import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, createMockPinia, flushPromises } from '@/test-utils'
import HomePage from './HomePage.vue'
import AddModal from '@/features/cashflows/modals/AddModal.vue'
import ChangeModal from '@/features/cashflows/modals/ChangeModal.vue'
import { useCashFlowsStore } from '@/features/cashflows/states/cashFlowsStore'
import * as toolsHelper from '@/helpers/toolsHelper'

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders metric cards with formatted financial data', async () => {
    const mockStats = {
      cashflow: 1500000,
      total_inflow: 2000000,
      total_outflow: 500000,
      total_inflow_cash: 1000000,
      total_outflow_cash: 200000,
      total_inflow_savings: 1000000,
      total_outflow_savings: 300000,
      total_inflow_loans: 0,
      total_outflow_loans: 0
    }

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.stats = mockStats
      return {} as any
    })
    cashFlowsStore.stats = mockStats

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(wrapper.find('#metric-net-cashflow').text()).toMatch(/Rp\s?1\.500\.000/)
    expect(wrapper.find('#metric-total-inflow').text()).toMatch(/Rp\s?2\.000\.000/)
    expect(wrapper.find('#metric-total-outflow').text()).toMatch(/Rp\s?500\.000/)
    expect(wrapper.find('#metric-cash-balance').text()).toMatch(/Rp\s?800\.000/)
    expect(wrapper.find('#metric-savings-balance').text()).toMatch(/Rp\s?700\.000/)
    expect(wrapper.find('#metric-loans-balance').text()).toMatch(/Rp\s?0/)
  })

  it('shows loading state when cashFlowsStore.isLoading is true', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.isLoading = true
      return new Promise(() => {})
    })
    cashFlowsStore.isLoading = true

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('Memuat data arus kas...')
  })

  it('shows empty state when cashFlows list is empty', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.cashFlows = []
      return {} as any
    })

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('Belum ada transaksi tercatat')
  })

  it('renders cash flow table records with action buttons', async () => {
    const mockCashFlows = [
      {
        id: 1,
        user_id: 1,
        type: 'inflow' as const,
        source: 'cash' as const,
        label: 'gaji',
        description: 'Gaji kantor',
        nominal: 5000000,
        created_at: '2024-10-05T12:00:00Z',
        updated_at: '2024-10-05T12:00:00Z'
      },
      {
        id: 2,
        user_id: 1,
        type: 'outflow' as const,
        source: 'savings' as const,
        label: 'belanja',
        description: 'Belanja bulanan',
        nominal: 1000000,
        created_at: '2024-10-05T12:00:00Z',
        updated_at: '2024-10-05T12:00:00Z'
      },
      {
        id: 3,
        user_id: 1,
        type: 'outflow' as const,
        source: 'loans' as const,
        label: 'hutang',
        description: 'Cicilan',
        nominal: 500000,
        created_at: '2024-10-05T12:00:00Z',
        updated_at: '2024-10-05T12:00:00Z'
      }
    ]

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.cashFlows = mockCashFlows
      return {} as any
    })
    cashFlowsStore.cashFlows = mockCashFlows

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(wrapper.text()).toContain('#gaji')
    expect(wrapper.text()).toContain('#belanja')
    expect(wrapper.find('#btn-detail-1').exists()).toBe(true)
    expect(wrapper.find('#btn-edit-1').exists()).toBe(true)
    expect(wrapper.find('#btn-delete-1').exists()).toBe(true)
  })

  it('applies filters and resets filters', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    const fetchSpy = vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockResolvedValue({} as any)

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    await wrapper.find('select#filter-type').setValue('inflow')
    await wrapper.find('select#filter-source').setValue('cash')
    await wrapper.find('input#filter-label').setValue('gaji')
    await wrapper.find('input#filter-start-date').setValue('2024-10-01')
    await wrapper.find('input#filter-end-date').setValue('2024-10-10')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inflow',
        source: 'cash',
        label: 'gaji',
        start_date: '2024-10-01 00:00:00',
        end_date: '2024-10-10 23:59:59'
      })
    )

    await wrapper.find('button#btn-reset-filters').trigger('click')
    expect(fetchSpy).toHaveBeenCalledWith({})
  })

  it('opens and closes AddModal and ChangeModal', async () => {
    const mockCashFlows = [
      {
        id: 7,
        user_id: 1,
        type: 'inflow' as const,
        source: 'cash' as const,
        label: 'bonus',
        description: 'bonus kerja',
        nominal: 200000,
        created_at: '',
        updated_at: ''
      }
    ]

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.cashFlows = mockCashFlows
      return {} as any
    })
    cashFlowsStore.cashFlows = mockCashFlows

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    await wrapper.find('button#btn-open-add-modal').trigger('click')
    await flushPromises()
    expect(wrapper.find('#modal-add-title').exists()).toBe(true)

    // Emit close and success on AddModal
    const addModal = wrapper.findComponent(AddModal)
    addModal.vm.$emit('close')
    await flushPromises()
    expect(wrapper.find('#modal-add-title').exists()).toBe(false)

    addModal.vm.$emit('success')
    await flushPromises()

    await wrapper.find('#btn-edit-7').trigger('click')
    await flushPromises()
    expect(wrapper.find('#modal-change-title').exists()).toBe(true)

    // Trigger closeChangeModal via modal emit
    const changeModal = wrapper.findComponent(ChangeModal)
    changeModal.vm.$emit('close')
    await flushPromises()
    expect(wrapper.find('#modal-change-title').exists()).toBe(false)

    changeModal.vm.$emit('success')
    await flushPromises()
  })

  it('handles item deletion when confirmed', async () => {
    const mockCashFlows = [
      {
        id: 7,
        user_id: 1,
        type: 'inflow' as const,
        source: 'cash' as const,
        label: 'bonus',
        description: '',
        nominal: 100,
        created_at: '',
        updated_at: ''
      }
    ]

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.cashFlows = mockCashFlows
      return {} as any
    })
    cashFlowsStore.cashFlows = mockCashFlows

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    const deleteSpy = vi.spyOn(cashFlowsStore, 'deleteCashFlow').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    await wrapper.find('#btn-delete-7').trigger('click')

    expect(deleteSpy).toHaveBeenCalledWith(7)
    expect(successSpy).toHaveBeenCalledWith('Catatan transaksi berhasil dihapus!')
  })

  it('handles item deletion error', async () => {
    const mockCashFlows = [
      {
        id: 7,
        user_id: 1,
        type: 'inflow' as const,
        source: 'cash' as const,
        label: 'bonus',
        description: '',
        nominal: 100,
        created_at: '',
        updated_at: ''
      }
    ]

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.cashFlows = mockCashFlows
      return {} as any
    })
    cashFlowsStore.cashFlows = mockCashFlows

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(cashFlowsStore, 'deleteCashFlow').mockRejectedValue(new Error('Gagal hapus'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('#btn-delete-7').trigger('click')
    expect(errorSpy).toHaveBeenCalledWith('Gagal hapus')
  })

  it('cancels item deletion when dialog cancelled', async () => {
    const mockCashFlows = [
      {
        id: 7,
        user_id: 1,
        type: 'inflow' as const,
        source: 'cash' as const,
        label: 'bonus',
        description: '',
        nominal: 100,
        created_at: '',
        updated_at: ''
      }
    ]

    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockImplementation(async () => {
      cashFlowsStore.cashFlows = mockCashFlows
      return {} as any
    })
    cashFlowsStore.cashFlows = mockCashFlows

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(false)
    const deleteSpy = vi.spyOn(cashFlowsStore, 'deleteCashFlow')

    await wrapper.find('#btn-delete-7').trigger('click')
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('handles delete all cash flows', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    const deleteAllSpy = vi.spyOn(cashFlowsStore, 'deleteAllCashFlows').mockResolvedValue({} as any)
    const successSpy = vi.spyOn(toolsHelper, 'showSuccessDialog').mockResolvedValue()

    await wrapper.find('button#btn-delete-all-cashflows').trigger('click')

    expect(deleteAllSpy).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith('Seluruh catatan arus kas berhasil direset!')
  })

  it('handles delete all cash flows error', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(cashFlowsStore, 'deleteAllCashFlows').mockRejectedValue(new Error('Server error reset'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('button#btn-delete-all-cashflows').trigger('click')
    expect(errorSpy).toHaveBeenCalledWith('Server error reset')
  })

  it('cancels delete all when dialog is rejected', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(false)
    const deleteAllSpy = vi.spyOn(cashFlowsStore, 'deleteAllCashFlows')

    await wrapper.find('button#btn-delete-all-cashflows').trigger('click')
    expect(deleteAllSpy).not.toHaveBeenCalled()
  })

  it('shows error dialog when fetchCashFlows fails on mount', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockRejectedValue(new Error('Gagal ambil data'))
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal ambil data')
  })

  it('shows fallback error dialog when fetchCashFlows fails on mount without message', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Gagal memuat catatan arus kas')
  })

  it('shows fallback error dialog when deleteItem fails without message', async () => {
    const mockCashFlows = [
      { id: 9, type: 'inflow' as const, source: 'cash' as const, label: 'x', nominal: 10, description: '', created_at: '', updated_at: '', user_id: 1 }
    ]
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockResolvedValue({} as any)
    cashFlowsStore.cashFlows = mockCashFlows

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(cashFlowsStore, 'deleteCashFlow').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('#btn-delete-9').trigger('click')
    expect(errorSpy).toHaveBeenCalledWith('Gagal menghapus transaksi')
  })

  it('shows fallback error dialog when deleteAll fails without message', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)

    const { wrapper } = renderWithProviders(HomePage, { pinia })
    await flushPromises()

    vi.spyOn(toolsHelper, 'showConfirmDialog').mockResolvedValue(true)
    vi.spyOn(cashFlowsStore, 'deleteAllCashFlows').mockRejectedValue({})
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    await wrapper.find('button#btn-delete-all-cashflows').trigger('click')
    expect(errorSpy).toHaveBeenCalledWith('Gagal mereset catatan arus kas')
  })

  it('silently ignores 401 authentication errors when fetching cash flows on mount', async () => {
    const pinia = createMockPinia()
    const cashFlowsStore = useCashFlowsStore(pinia)
    const authErr = new Error('Belum melakukan autentikasi') as any
    authErr.status = 401
    vi.spyOn(cashFlowsStore, 'fetchCashFlows').mockRejectedValue(authErr)
    const errorSpy = vi.spyOn(toolsHelper, 'showErrorDialog').mockResolvedValue()

    renderWithProviders(HomePage, { pinia })
    await flushPromises()

    expect(errorSpy).not.toHaveBeenCalled()
  })
})
