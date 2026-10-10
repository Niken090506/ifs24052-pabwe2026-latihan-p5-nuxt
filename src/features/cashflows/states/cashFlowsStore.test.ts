import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCashFlowsStore } from './cashFlowsStore'
import * as cashFlowApi from '@/features/cashflows/api/cashFlowApi'

describe('useCashFlowsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state and calculates getters correctly', () => {
    const store = useCashFlowsStore()
    expect(store.cashFlows).toEqual([])
    expect(store.cashFlow).toBeNull()
    expect(store.stats).toEqual({})
    expect(store.labels).toEqual([])
    expect(store.isLoading).toBe(false)

    // Test default zero getters
    expect(store.totalInflow).toBe(0)
    expect(store.totalOutflow).toBe(0)
    expect(store.netCashFlow).toBe(0)
    expect(store.cashBalance).toBe(0)
    expect(store.savingsBalance).toBe(0)
    expect(store.loansBalance).toBe(0)

    // Set stats and verify getters
    store.stats = {
      cashflow: 500000,
      total_inflow: 1000000,
      total_outflow: 500000,
      total_inflow_cash: 700000,
      total_outflow_cash: 200000,
      total_inflow_savings: 300000,
      total_outflow_savings: 300000,
      total_inflow_loans: 0,
      total_outflow_loans: 0
    }

    expect(store.netCashFlow).toBe(500000)
    expect(store.totalInflow).toBe(1000000)
    expect(store.totalOutflow).toBe(500000)
    expect(store.cashBalance).toBe(500000)
    expect(store.savingsBalance).toBe(0)
    expect(store.loansBalance).toBe(0)
  })

  it('resets mutation flags with resetMutationStatus', () => {
    const store = useCashFlowsStore()
    store.isCashFlowAdded = true
    store.isCashFlowChanged = true
    store.isCashFlowDeleted = true
    store.isCashFlowDeletedAll = true

    store.resetMutationStatus()

    expect(store.isCashFlowAdded).toBe(false)
    expect(store.isCashFlowChanged).toBe(false)
    expect(store.isCashFlowDeleted).toBe(false)
    expect(store.isCashFlowDeletedAll).toBe(false)
  })

  it('fetches cash flows list successfully', async () => {
    const mockCashFlows = [
      { id: 1, type: 'inflow', source: 'cash', nominal: 1000, label: 'test', description: 'desc', created_at: '', updated_at: '', user_id: 1 }
    ]
    const mockStats = { cashflow: 1000 }
    vi.spyOn(cashFlowApi, 'getCashFlowsApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: { cash_flows: mockCashFlows as any, stats: mockStats }
    })

    const store = useCashFlowsStore()
    const res = await store.fetchCashFlows()

    expect(store.cashFlows).toEqual(mockCashFlows)
    expect(store.stats).toEqual(mockStats)
    expect(store.isLoading).toBe(false)
  })

  it('handles empty response data in fetchCashFlows', async () => {
    vi.spyOn(cashFlowApi, 'getCashFlowsApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: {} as any
    })

    const store = useCashFlowsStore()
    await store.fetchCashFlows()
    expect(store.cashFlows).toEqual([])
    expect(store.stats).toEqual({})
  })

  it('resets isLoading on fetchCashFlows failure', async () => {
    vi.spyOn(cashFlowApi, 'getCashFlowsApi').mockRejectedValue(new Error('Fetch failed'))
    const store = useCashFlowsStore()

    await expect(store.fetchCashFlows()).rejects.toThrow('Fetch failed')
    expect(store.isLoading).toBe(false)
  })

  it('fetches single cash flow detail by id', async () => {
    const mockDetail = { id: 5, nominal: 25000 }
    vi.spyOn(cashFlowApi, 'getCashFlowByIdApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: { cash_flow: mockDetail as any }
    })

    const store = useCashFlowsStore()
    await store.fetchCashFlowById(5)

    expect(store.cashFlow).toEqual(mockDetail)
    expect(store.isLoading).toBe(false)
  })

  it('handles empty response data in fetchCashFlowById', async () => {
    vi.spyOn(cashFlowApi, 'getCashFlowByIdApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: {} as any
    })

    const store = useCashFlowsStore()
    await store.fetchCashFlowById(5)
    expect(store.cashFlow).toBeNull()
  })

  it('resets isLoading on fetchCashFlowById error', async () => {
    vi.spyOn(cashFlowApi, 'getCashFlowByIdApi').mockRejectedValue(new Error('Detail not found'))
    const store = useCashFlowsStore()

    await expect(store.fetchCashFlowById(99)).rejects.toThrow('Detail not found')
    expect(store.isLoading).toBe(false)
  })

  it('adds cash flow and tracks mutation state', async () => {
    vi.spyOn(cashFlowApi, 'addCashFlowApi').mockResolvedValue({
      status: 'success',
      message: 'Created',
      data: { cash_flow_id: 99 }
    })

    const store = useCashFlowsStore()
    const res = await store.addCashFlow({
      type: 'inflow',
      source: 'cash',
      label: 'bonus',
      nominal: 50000,
      description: 'bonus akhir tahun'
    })

    expect(res.data.cash_flow_id).toBe(99)
    expect(store.isCashFlowAdded).toBe(true)
    expect(store.isCashFlowAdd).toBe(false)
  })

  it('resets isCashFlowAdd on addCashFlow failure', async () => {
    vi.spyOn(cashFlowApi, 'addCashFlowApi').mockRejectedValue(new Error('Add failed'))
    const store = useCashFlowsStore()

    await expect(store.addCashFlow({} as any)).rejects.toThrow('Add failed')
    expect(store.isCashFlowAdd).toBe(false)
    expect(store.isCashFlowAdded).toBe(false)
  })

  it('updates cash flow and tracks mutation state', async () => {
    vi.spyOn(cashFlowApi, 'updateCashFlowApi').mockResolvedValue({
      status: 'success',
      message: 'Updated'
    })

    const store = useCashFlowsStore()
    await store.updateCashFlow(5, {
      type: 'outflow',
      source: 'savings',
      label: 'edit',
      nominal: 20000,
      description: 'edit desc'
    })

    expect(store.isCashFlowChanged).toBe(true)
    expect(store.isCashFlowChange).toBe(false)
  })

  it('resets isCashFlowChange on updateCashFlow failure', async () => {
    vi.spyOn(cashFlowApi, 'updateCashFlowApi').mockRejectedValue(new Error('Update failed'))
    const store = useCashFlowsStore()

    await expect(store.updateCashFlow(5, {} as any)).rejects.toThrow('Update failed')
    expect(store.isCashFlowChange).toBe(false)
    expect(store.isCashFlowChanged).toBe(false)
  })

  it('deletes cash flow and removes it from state list', async () => {
    vi.spyOn(cashFlowApi, 'deleteCashFlowApi').mockResolvedValue({
      status: 'success',
      message: 'Deleted'
    })

    const store = useCashFlowsStore()
    store.cashFlows = [
      { id: 1, type: 'inflow', source: 'cash', label: '1', nominal: 10, description: '', created_at: '', updated_at: '', user_id: 1 },
      { id: 2, type: 'outflow', source: 'cash', label: '2', nominal: 20, description: '', created_at: '', updated_at: '', user_id: 1 }
    ]

    await store.deleteCashFlow(1)

    expect(store.cashFlows.length).toBe(1)
    expect(store.cashFlows[0]?.id).toBe(2)
    expect(store.isCashFlowDeleted).toBe(true)
    expect(store.isCashFlowDelete).toBe(false)
  })

  it('resets isCashFlowDelete on delete failure', async () => {
    vi.spyOn(cashFlowApi, 'deleteCashFlowApi').mockRejectedValue(new Error('Delete error'))
    const store = useCashFlowsStore()

    await expect(store.deleteCashFlow(1)).rejects.toThrow('Delete error')
    expect(store.isCashFlowDelete).toBe(false)
    expect(store.isCashFlowDeleted).toBe(false)
  })

  it('fetches labels successfully and handles failure gracefully', async () => {
    vi.spyOn(cashFlowApi, 'getCashFlowLabelsApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: { labels: ['gaji', 'belanja'] }
    })

    const store = useCashFlowsStore()
    await store.fetchLabels()
    expect(store.labels).toEqual(['gaji', 'belanja'])

    vi.spyOn(cashFlowApi, 'getCashFlowLabelsApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: {} as any
    })
    await store.fetchLabels()
    expect(store.labels).toEqual([])

    vi.spyOn(cashFlowApi, 'getCashFlowLabelsApi').mockRejectedValue(new Error('Label error'))
    await expect(store.fetchLabels()).rejects.toThrow('Label error')
    expect(store.labels).toEqual([])
  })

  it('fetches daily stats successfully and handles error', async () => {
    const mockDaily = { stats_inflow: { '01-10': 100 }, stats_outflow: {}, stats_cashflow: {} }
    vi.spyOn(cashFlowApi, 'getStatsDailyApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: mockDaily
    })

    const store = useCashFlowsStore()
    await store.fetchStatsDaily()
    expect(store.statsDaily).toEqual(mockDaily)

    vi.spyOn(cashFlowApi, 'getStatsDailyApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: undefined as any
    })
    await store.fetchStatsDaily()
    expect(store.statsDaily).toBeNull()

    vi.spyOn(cashFlowApi, 'getStatsDailyApi').mockRejectedValue(new Error('Daily error'))
    await expect(store.fetchStatsDaily()).rejects.toThrow('Daily error')
    expect(store.statsDaily).toBeNull()
  })

  it('fetches monthly stats successfully and handles error', async () => {
    const mockMonthly = { stats_inflow: { '10-2024': 100 }, stats_outflow: {}, stats_cashflow: {} }
    vi.spyOn(cashFlowApi, 'getStatsMonthlyApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: mockMonthly
    })

    const store = useCashFlowsStore()
    await store.fetchStatsMonthly()
    expect(store.statsMonthly).toEqual(mockMonthly)

    vi.spyOn(cashFlowApi, 'getStatsMonthlyApi').mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: undefined as any
    })
    await store.fetchStatsMonthly()
    expect(store.statsMonthly).toBeNull()

    vi.spyOn(cashFlowApi, 'getStatsMonthlyApi').mockRejectedValue(new Error('Monthly error'))
    await expect(store.fetchStatsMonthly()).rejects.toThrow('Monthly error')
    expect(store.statsMonthly).toBeNull()
  })

  it('deletes all cash flows and clears state', async () => {
    vi.spyOn(cashFlowApi, 'deleteAllCashFlowsApi').mockResolvedValue({
      status: 'success',
      message: 'All reset'
    })

    const store = useCashFlowsStore()
    store.cashFlows = [{ id: 1 } as any]
    store.stats = { total_inflow: 500 }

    await store.deleteAllCashFlows()

    expect(store.cashFlows).toEqual([])
    expect(store.stats).toEqual({})
    expect(store.isCashFlowDeletedAll).toBe(true)
    expect(store.isCashFlowDeleteAll).toBe(false)
  })

  it('resets isCashFlowDeleteAll on deleteAll error', async () => {
    vi.spyOn(cashFlowApi, 'deleteAllCashFlowsApi').mockRejectedValue(new Error('Reset failed'))
    const store = useCashFlowsStore()

    await expect(store.deleteAllCashFlows()).rejects.toThrow('Reset failed')
    expect(store.isCashFlowDeleteAll).toBe(false)
    expect(store.isCashFlowDeletedAll).toBe(false)
  })
})
