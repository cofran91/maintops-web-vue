export type MetricTone = 'blue' | 'teal' | 'amber' | 'red'

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
