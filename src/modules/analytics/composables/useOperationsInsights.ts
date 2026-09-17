import { computed, onBeforeUnmount, ref } from 'vue'
import { normalizeApiError } from '@/api/errors'
import dashboardApi from '@/modules/dashboard/services/dashboardService'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService'
import { ORDER_STATUS_LABELS, type MaintenanceOrder } from '@/types/maintenanceOrder'
import type { AnalyticsStatusRow, OperationsInsights, WorkshopPerformanceRow } from '@/types/analytics'

const STATUS_COLORS: Record<string, string> = {
  created: '#7c8ba6',
  pending_owner_approval: '#d58930',
  approved: '#397eea',
  partially_approved: '#6793e9',
  rejected: '#dc5967',
  scheduled: '#14a694',
  in_progress: '#3158e7',
  completed: '#239878',
  delivered: '#6b7e9d',
  cancelled: '#b65362',
}

const ACTIVE_STATUSES = new Set(['approved', 'partially_approved', 'scheduled', 'in_progress'])
const ATTENTION_STATUSES = new Set(['created', 'pending_owner_approval', 'approved', 'rejected'])

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const requestError = error as { code?: string; name?: string }

  return (
    requestError.code === 'ERR_CANCELED' ||
    requestError.name === 'AbortError' ||
    requestError.name === 'CanceledError'
  )
}

const orderIsOverdue = (order: MaintenanceOrder) => {
  if (!order.scheduled_at || ['completed', 'delivered', 'cancelled'].includes(order.status)) {
    return false
  }

  return new Date(order.scheduled_at).getTime() < Date.now()
}

const orderWorkshopName = (order: MaintenanceOrder) =>
  order.workshop?.name || order.workshop?.code || 'Sin taller asignado'

export const useOperationsInsights = () => {
  const summary = ref<OperationsInsights | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const lastUpdated = ref<Date | null>(null)
  let controller: AbortController | null = null

  const buildInsights = (
    dashboard: Awaited<ReturnType<typeof dashboardApi.summary>>,
    orders: Awaited<ReturnType<typeof maintenanceOrdersApi.index>>,
  ): OperationsInsights => {
    const statusCounts = dashboard.orders_by_status ?? {}
    const totalOrders = Number(dashboard.metrics.total_orders ?? orders.pagination.total ?? 0)
    const getStatusCount = (status: string) => Number(statusCounts[status] ?? 0)
    const activeOrders = Number(
      dashboard.metrics.active_orders ??
        [...ACTIVE_STATUSES].reduce((total, status) => total + getStatusCount(status), 0),
    )
    const awaitingApproval = Number(dashboard.metrics.awaiting_owner_approval ?? getStatusCount('pending_owner_approval'))
    const overdueActivities = Number(
      dashboard.metrics.overdue_activities ?? orders.items.filter(orderIsOverdue).length,
    )
    const completedOrders = getStatusCount('completed') + getStatusCount('delivered')
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

    const statusRows: AnalyticsStatusRow[] = Object.entries(ORDER_STATUS_LABELS)
      .map(([key, label]) => ({
        key,
        label,
        count: getStatusCount(key),
        percentage: totalOrders > 0 ? Math.round((getStatusCount(key) / totalOrders) * 100) : 0,
        color: STATUS_COLORS[key] || '#7c8ba6',
      }))
      .filter((row) => row.count > 0 || ['scheduled', 'in_progress', 'completed'].includes(row.key))

    const workshopMap = new Map<number | null, WorkshopPerformanceRow>()

    orders.items.forEach((order) => {
      const workshopId = order.workshop?.id ?? null
      const existing = workshopMap.get(workshopId) || {
        id: workshopId,
        name: orderWorkshopName(order),
        code: order.workshop?.code || '—',
        total: 0,
        active: 0,
        completed: 0,
        scheduled: 0,
      }

      existing.total += 1
      if (ACTIVE_STATUSES.has(order.status)) existing.active += 1
      if (['completed', 'delivered'].includes(order.status)) existing.completed += 1
      if (order.status === 'scheduled') existing.scheduled += 1
      workshopMap.set(workshopId, existing)
    })

    const workshopRows = [...workshopMap.values()]
      .sort((left, right) => right.total - left.total)
      .slice(0, 6)

    const attentionOrders = [...orders.items]
      .filter((order) => ATTENTION_STATUSES.has(order.status) || orderIsOverdue(order))
      .sort((left, right) => {
        const leftPriority = orderIsOverdue(left) ? 0 : 1
        const rightPriority = orderIsOverdue(right) ? 0 : 1
        return leftPriority - rightPriority || left.id - right.id
      })
      .slice(0, 6)

    return {
      totalOrders,
      activeOrders,
      scheduledToday: dashboard.today_schedules?.length ?? 0,
      awaitingApproval,
      overdueActivities,
      completionRate,
      statusRows,
      workshopRows,
      attentionOrders,
    }
  }

  const fetchInsights = async () => {
    controller?.abort()

    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''

    try {
      const [dashboard, orders] = await Promise.all([
        dashboardApi.summary({ signal: nextController.signal }),
        maintenanceOrdersApi.index(
          { search: '', status: '', page: 1, per_page: 100 },
          { signal: nextController.signal },
        ),
      ])

      summary.value = buildInsights(dashboard, orders)
      lastUpdated.value = new Date()
    } catch (error) {
      if (!isCanceledRequest(error)) {
        errorMessage.value = normalizeApiError(error).message
      }
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const isReady = computed(() => Boolean(summary.value))

  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return {
    insights: summary,
    isReady,
    loading,
    errorMessage,
    lastUpdated,
    fetchInsights,
  }
}
