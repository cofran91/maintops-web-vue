import type { MaintenanceOrder } from '@/types/maintenanceOrder'

export interface AnalyticsStatusRow {
  key: string
  label: string
  count: number
  percentage: number
  color: string
}

export interface WorkshopPerformanceRow {
  id: number | null
  name: string
  code: string
  total: number
  active: number
  completed: number
  scheduled: number
}

export interface OperationsInsights {
  totalOrders: number
  activeOrders: number
  scheduledToday: number
  awaitingApproval: number
  overdueActivities: number
  completionRate: number
  statusRows: AnalyticsStatusRow[]
  workshopRows: WorkshopPerformanceRow[]
  attentionOrders: MaintenanceOrder[]
}
