import { defineStore } from 'pinia'
import {
  getCashFlowsApi,
  getCashFlowByIdApi,
  addCashFlowApi,
  updateCashFlowApi,
  deleteCashFlowApi,
  getCashFlowLabelsApi,
  getStatsDailyApi,
  getStatsMonthlyApi,
  deleteAllCashFlowsApi,
  type CashFlow,
  type CashFlowStats,
  type CashFlowQueryParams,
  type AddCashFlowPayload,
  type UpdateCashFlowPayload
} from '@/features/cashflows/api/cashFlowApi'

export type { CashFlow, CashFlowStats, CashFlowQueryParams }

export interface CashFlowsState {
  cashFlows: CashFlow[]
  cashFlow: CashFlow | null
  stats: CashFlowStats
  labels: string[]
  statsDaily: {
    stats_inflow: Record<string, number>
    stats_outflow: Record<string, number>
    stats_cashflow: Record<string, number>
  } | null
  statsMonthly: {
    stats_inflow: Record<string, number>
    stats_outflow: Record<string, number>
    stats_cashflow: Record<string, number>
  } | null
  isLoading: boolean
  isCashFlowAdd: boolean
  isCashFlowAdded: boolean
  isCashFlowChange: boolean
  isCashFlowChanged: boolean
  isCashFlowDelete: boolean
  isCashFlowDeleted: boolean
  isCashFlowDeleteAll: boolean
  isCashFlowDeletedAll: boolean
}

export const useCashFlowsStore = defineStore('cashFlows', {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: {},
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isLoading: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false
  }),

  getters: {
    totalInflow: (state) => Number(state.stats?.total_inflow || 0),
    totalOutflow: (state) => Number(state.stats?.total_outflow || 0),
    netCashFlow: (state) => Number(state.stats?.cashflow || 0),
    cashBalance: (state) => {
      const inflow = Number(state.stats?.total_inflow_cash || 0)
      const outflow = Number(state.stats?.total_outflow_cash || 0)
      return inflow - outflow
    },
    savingsBalance: (state) => {
      const inflow = Number(state.stats?.total_inflow_savings || 0)
      const outflow = Number(state.stats?.total_outflow_savings || 0)
      return inflow - outflow
    },
    loansBalance: (state) => {
      const inflow = Number(state.stats?.total_inflow_loans || 0)
      const outflow = Number(state.stats?.total_outflow_loans || 0)
      return inflow - outflow
    }
  },

  actions: {
    resetMutationStatus() {
      this.isCashFlowAdded = false
      this.isCashFlowChanged = false
      this.isCashFlowDeleted = false
      this.isCashFlowDeletedAll = false
    },

    async fetchCashFlows(params?: CashFlowQueryParams) {
      this.isLoading = true
      try {
        const response = await getCashFlowsApi(params)
        this.cashFlows = response.data?.cash_flows || []
        this.stats = response.data?.stats || {}
        return response
      } finally {
        this.isLoading = false
      }
    },

    async fetchCashFlowById(id: number | string) {
      this.isLoading = true
      try {
        const response = await getCashFlowByIdApi(id)
        this.cashFlow = response.data?.cash_flow || null
        return response
      } finally {
        this.isLoading = false
      }
    },

    async addCashFlow(payload: AddCashFlowPayload) {
      this.isCashFlowAdd = true
      this.isCashFlowAdded = false
      try {
        const response = await addCashFlowApi(payload)
        this.isCashFlowAdded = true
        return response
      } finally {
        this.isCashFlowAdd = false
      }
    },

    async updateCashFlow(id: number | string, payload: UpdateCashFlowPayload) {
      this.isCashFlowChange = true
      this.isCashFlowChanged = false
      try {
        const response = await updateCashFlowApi(id, payload)
        this.isCashFlowChanged = true
        return response
      } finally {
        this.isCashFlowChange = false
      }
    },

    async deleteCashFlow(id: number | string) {
      this.isCashFlowDelete = true
      this.isCashFlowDeleted = false
      try {
        const response = await deleteCashFlowApi(id)
        this.isCashFlowDeleted = true
        this.cashFlows = this.cashFlows.filter((cf) => cf.id !== Number(id))
        return response
      } finally {
        this.isCashFlowDelete = false
      }
    },

    async fetchLabels() {
      try {
        const response = await getCashFlowLabelsApi()
        this.labels = response.data?.labels || []
        return response
      } catch (error) {
        this.labels = []
        throw error
      }
    },

    async fetchStatsDaily(params?: { end_date?: string; total_data?: number }) {
      try {
        const response = await getStatsDailyApi(params)
        this.statsDaily = response.data || null
        return response
      } catch (error) {
        this.statsDaily = null
        throw error
      }
    },

    async fetchStatsMonthly(params?: { end_date?: string; total_data?: number }) {
      try {
        const response = await getStatsMonthlyApi(params)
        this.statsMonthly = response.data || null
        return response
      } catch (error) {
        this.statsMonthly = null
        throw error
      }
    },

    async deleteAllCashFlows() {
      this.isCashFlowDeleteAll = true
      this.isCashFlowDeletedAll = false
      try {
        const response = await deleteAllCashFlowsApi()
        this.isCashFlowDeletedAll = true
        this.cashFlows = []
        this.stats = {}
        return response
      } finally {
        this.isCashFlowDeleteAll = false
      }
    }
  }
})
