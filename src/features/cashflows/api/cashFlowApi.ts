import { apiFetch } from '@/helpers/apiHelper'

export type CashFlowType = 'inflow' | 'outflow'
export type CashFlowSource = 'cash' | 'savings' | 'loans'

export interface CashFlow {
  id: number
  user_id: number
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
  created_at: string
  updated_at: string
}

export interface CashFlowStats {
  cashflow?: number
  total_inflow?: number
  total_outflow?: number
  total_inflow_cash?: number
  total_inflow_savings?: number
  total_inflow_loans?: number
  total_outflow_cash?: number
  total_outflow_savings?: number
  total_outflow_loans?: number
  [key: string]: any
}

export interface CashFlowQueryParams {
  type?: CashFlowType | string
  source?: CashFlowSource | string
  label?: string
  start_date?: string
  end_date?: string
}

export interface AddCashFlowPayload {
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
}

export interface UpdateCashFlowPayload {
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
}

export interface GetCashFlowsResponse {
  status: string
  message: string
  data: {
    cash_flows: CashFlow[]
    stats: CashFlowStats
  }
}

export interface GetCashFlowDetailResponse {
  status: string
  message: string
  data: {
    cash_flow: CashFlow
  }
}

export interface AddCashFlowResponse {
  status: string
  message: string
  data: {
    cash_flow_id: number
  }
}

export interface ActionResponse {
  status: string
  message: string
  data?: any
}

export interface GetLabelsResponse {
  status: string
  message: string
  data: {
    labels: string[]
  }
}

export interface DailyStatsResponse {
  status: string
  message: string
  data: {
    stats_inflow: Record<string, number>
    stats_outflow: Record<string, number>
    stats_cashflow: Record<string, number>
  }
}

export interface MonthlyStatsResponse {
  status: string
  message: string
  data: {
    stats_inflow: Record<string, number>
    stats_outflow: Record<string, number>
    stats_cashflow: Record<string, number>
  }
}

export async function getCashFlowsApi(params?: CashFlowQueryParams): Promise<GetCashFlowsResponse> {
  return await apiFetch<GetCashFlowsResponse>('/cash-flows', {
    params: params as any
  })
}

export async function getCashFlowByIdApi(id: number | string): Promise<GetCashFlowDetailResponse> {
  return await apiFetch<GetCashFlowDetailResponse>(`/cash-flows/${id}`)
}

export async function addCashFlowApi(payload: AddCashFlowPayload): Promise<AddCashFlowResponse> {
  return await apiFetch<AddCashFlowResponse>('/cash-flows', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function updateCashFlowApi(id: number | string, payload: UpdateCashFlowPayload): Promise<ActionResponse> {
  return await apiFetch<ActionResponse>(`/cash-flows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export async function deleteCashFlowApi(id: number | string): Promise<ActionResponse> {
  return await apiFetch<ActionResponse>(`/cash-flows/${id}`, {
    method: 'DELETE'
  })
}

export async function getCashFlowLabelsApi(): Promise<GetLabelsResponse> {
  return await apiFetch<GetLabelsResponse>('/cash-flows/labels')
}

export async function getStatsDailyApi(params?: { end_date?: string; total_data?: number }): Promise<DailyStatsResponse> {
  return await apiFetch<DailyStatsResponse>('/cash-flows/stats/daily', {
    params: params as any
  })
}

export async function getStatsMonthlyApi(params?: { end_date?: string; total_data?: number }): Promise<MonthlyStatsResponse> {
  return await apiFetch<MonthlyStatsResponse>('/cash-flows/stats/monthly', {
    params: params as any
  })
}

export async function deleteAllCashFlowsApi(): Promise<ActionResponse> {
  return await apiFetch<ActionResponse>('/cash-flows', {
    method: 'DELETE'
  })
}

export default {
  getCashFlowsApi,
  getCashFlowByIdApi,
  addCashFlowApi,
  updateCashFlowApi,
  deleteCashFlowApi,
  getCashFlowLabelsApi,
  getStatsDailyApi,
  getStatsMonthlyApi,
  deleteAllCashFlowsApi
}
