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

export interface AnalyticsFilters {
  start_date?: string
  end_date?: string
  technician_id?: number
  workshop_id?: number
  horizon_days?: number
}

export interface AnalyticsPeriod {
  start_date: string
  end_date: string
  timezone?: string
}

export interface AnalyticsScope {
  scope?: string
  type?: string
  workshop_id?: number | null
  [key: string]: unknown
}

export interface AnalyticsSample {
  activities?: number
  comparable_completed_activities?: number
  minimum_comparable_activities?: number
  sufficient_for_duration_comparison?: boolean
}

export interface AnalyticsDurationComparison {
  actual_minutes?: number | null
  planned_minutes?: number | null
  variance_minutes?: number | null
  actual_to_planned_ratio?: number | null
  comparable_completed_activities?: number
  sufficient_data?: boolean
}

export interface AnalyticsCountSignal {
  count?: number
}

export interface TechnicianEfficiencyMetric {
  technician_id: number
  actual_vs_planned?: AnalyticsDurationComparison
  active_activities?: AnalyticsCountSignal
  scheduled_queue?: AnalyticsCountSignal
  cancellations?: AnalyticsCountSignal
}

export interface WorkshopBottleneckMetric {
  workshop_id: number
  actual_vs_planned?: AnalyticsDurationComparison
  active_activities?: AnalyticsCountSignal
  scheduled_queue?: AnalyticsCountSignal
  cancellations?: AnalyticsCountSignal
}

export interface AnalyticsForecast {
  workshop_id: number
  horizon?: { start_date?: string; end_date?: string; days?: number }
  capacity?: { available_technicians?: number; open_days?: number; minutes?: number }
  forecast?: {
    projected_workload_minutes?: number
    projected_unallocated_minutes?: number
    utilization_ratio?: number | null
  }
  confidence?: {
    level?: string
    data_sufficient?: boolean
    unknown_duration_activities?: number
    reason_codes?: string[]
    reasons?: string[]
  }
  active?: { activities?: number; minutes?: number; overdue_active_activities?: number }
  [key: string]: unknown
}

export interface AnalyticsAlert {
  id: string
  severity?: string
  workshop_id?: number
  explanation?: string
  explanation_code?: string
  facts?: Record<string, unknown>
  horizon?: AnalyticsForecast['horizon']
}

export interface AnalyticsRecommendation {
  id: string
  priority?: string
  workshop_id?: number
  suggested_review?: string
  suggested_review_code?: string
  automatic_action?: boolean
  facts?: Record<string, unknown>
}

export interface AnalyticsEndpointResponse {
  algorithm_version?: string
  period?: AnalyticsPeriod
  scope?: AnalyticsScope
  sample?: AnalyticsSample
  horizon_days?: number
  technicians?: TechnicianEfficiencyMetric[]
  workshops?: WorkshopBottleneckMetric[]
  forecasts?: AnalyticsForecast[]
  alerts?: AnalyticsAlert[]
  recommendations?: AnalyticsRecommendation[]
}

export interface AnalyticsOverview {
  technicianEfficiency: AnalyticsEndpointResponse
  workshopBottlenecks: AnalyticsEndpointResponse
  workloadForecast: AnalyticsEndpointResponse
  riskAlerts: AnalyticsEndpointResponse
  recommendations: AnalyticsEndpointResponse
}
