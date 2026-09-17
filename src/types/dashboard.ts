export type MetricTone = 'blue' | 'teal' | 'amber' | 'red'

export interface DashboardVehicle {
  id: number
  license_plate: string
  brand?: string | null
  model?: string | null
}

export interface DashboardWorkshop {
  id: number
  name: string
  code: string
  city?: string | null
}

export interface DashboardUser {
  id: number
  name: string
  email: string
}

export interface DashboardOrderCard {
  maintenance_order_id: number
  status: string
  scheduled_at?: string | null
  finished_at?: string | null
  vehicle?: DashboardVehicle | null
  workshop?: DashboardWorkshop | null
  technician?: DashboardUser | null
}

export interface DashboardSummary {
  orders_by_status: Record<string, number>
  metrics: Record<string, number>
  activities: {
    pending: number
    active: number
  }
  today_schedules: DashboardOrderCard[]
  upcoming_schedules: DashboardOrderCard[]
  role_context: Record<string, unknown>
}

export interface DashboardStat {
  label: string
  value: string
  detail: string
  change: string
  icon: string
  tone: MetricTone
  points: string
}

export interface WeekActivity {
  day: string
  planned: number
  completed: number
}

export interface StatusBreakdown {
  label: string
  value: number
  count: number
  color: string
}

export interface RecentOrder {
  orderId: number
  id: string
  vehicle: string
  plate: string
  workshop: string
  technician: string
  initials: string
  date: string
  status: string
  statusKey: 'progress' | 'done' | 'scheduled' | 'pending'
}

export interface UpcomingTask {
  time: string
  title: string
  vehicle: string
  location: string
  tone: 'blue' | 'teal' | 'amber'
}
