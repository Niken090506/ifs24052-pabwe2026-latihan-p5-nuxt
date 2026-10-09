import { describe, it, expect, vi } from 'vitest'
import * as apiHelper from '@/helpers/apiHelper'
import cashFlowApiDefault, {
  getCashFlowsApi,
  getCashFlowByIdApi,
  addCashFlowApi,
  updateCashFlowApi,
  deleteCashFlowApi,
  getCashFlowLabelsApi,
  getStatsDailyApi,
  getStatsMonthlyApi,
  deleteAllCashFlowsApi
} from './cashFlowApi'

describe('cashFlowApi', () => {
  it('calls getCashFlowsApi with query parameters', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { cash_flows: [], stats: {} }
    } as any)

    const params = { type: 'inflow', source: 'cash', label: 'gaji' }
    const res = await getCashFlowsApi(params)

    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows', {
      params
    })
    expect(res.status).toBe('success')
  })

  it('calls getCashFlowByIdApi with ID', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { cash_flow: { id: 1 } }
    } as any)

    const res = await getCashFlowByIdApi(1)
    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows/1')
    expect(res.status).toBe('success')
  })

  it('calls addCashFlowApi with POST and body', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { cash_flow_id: 10 }
    } as any)

    const payload = {
      type: 'inflow' as const,
      source: 'cash' as const,
      label: 'Honor',
      description: 'Honor kerja',
      nominal: 1000000
    }
    const res = await addCashFlowApi(payload)

    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    expect(res.data.cash_flow_id).toBe(10)
  })

  it('calls updateCashFlowApi with PUT and body', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Berhasil diubah'
    } as any)

    const payload = {
      type: 'outflow' as const,
      source: 'savings' as const,
      label: 'Makan',
      description: 'Makan siang',
      nominal: 50000
    }
    const res = await updateCashFlowApi(5, payload)

    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows/5', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    expect(res.status).toBe('success')
  })

  it('calls deleteCashFlowApi with DELETE', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Berhasil dihapus'
    } as any)

    const res = await deleteCashFlowApi(5)
    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows/5', {
      method: 'DELETE'
    })
    expect(res.status).toBe('success')
  })

  it('calls getCashFlowLabelsApi with GET /cash-flows/labels', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { labels: ['gaji', 'makan'] }
    } as any)

    const res = await getCashFlowLabelsApi()
    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows/labels')
    expect(res.data.labels).toEqual(['gaji', 'makan'])
  })

  it('calls getStatsDailyApi with params', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} }
    } as any)

    const params = { end_date: '2024-10-05', total_data: 7 }
    const res = await getStatsDailyApi(params)

    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows/stats/daily', {
      params
    })
    expect(res.status).toBe('success')
  })

  it('calls getStatsMonthlyApi with params', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      data: { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} }
    } as any)

    const params = { end_date: '2024-10-05', total_data: 12 }
    const res = await getStatsMonthlyApi(params)

    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows/stats/monthly', {
      params
    })
    expect(res.status).toBe('success')
  })

  it('calls deleteAllCashFlowsApi with DELETE /cash-flows', async () => {
    const apiFetchSpy = vi.spyOn(apiHelper, 'apiFetch').mockResolvedValue({
      status: 'success',
      message: 'Semua cash flow dihapus'
    } as any)

    const res = await deleteAllCashFlowsApi()
    expect(apiFetchSpy).toHaveBeenCalledWith('/cash-flows', {
      method: 'DELETE'
    })
    expect(res.status).toBe('success')
  })

  it('checks default export', () => {
    expect(cashFlowApiDefault.getCashFlowsApi).toBe(getCashFlowsApi)
    expect(cashFlowApiDefault.getCashFlowByIdApi).toBe(getCashFlowByIdApi)
    expect(cashFlowApiDefault.addCashFlowApi).toBe(addCashFlowApi)
    expect(cashFlowApiDefault.updateCashFlowApi).toBe(updateCashFlowApi)
    expect(cashFlowApiDefault.deleteCashFlowApi).toBe(deleteCashFlowApi)
    expect(cashFlowApiDefault.getCashFlowLabelsApi).toBe(getCashFlowLabelsApi)
    expect(cashFlowApiDefault.getStatsDailyApi).toBe(getStatsDailyApi)
    expect(cashFlowApiDefault.getStatsMonthlyApi).toBe(getStatsMonthlyApi)
    expect(cashFlowApiDefault.deleteAllCashFlowsApi).toBe(deleteAllCashFlowsApi)
  })
})
