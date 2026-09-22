import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { normalizeApiError } from '@/api/errors'
import maintenanceOrdersApi from '@/modules/maintenance-orders/services/maintenanceOrdersService'
import type { MaintenanceOrder, MaintenanceOrderPage } from '@/types/maintenanceOrder'

export interface ScheduleEvent {
  order: MaintenanceOrder
  dateKey: string
  timeLabel: string
}

const toDateKey = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== 'object' || error === null) return false
  const requestError = error as { code?: string; name?: string }
  return requestError.code === 'ERR_CANCELED' || requestError.name === 'AbortError' || requestError.name === 'CanceledError'
}

export const useMaintenanceSchedule = () => {
  const { locale } = useI18n()
  const orders = ref<MaintenanceOrder[]>([])
  const currentMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const selectedDay = ref(toDateKey(new Date()))
  const loading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  const events = computed<ScheduleEvent[]>(() =>
    orders.value.flatMap((order) => {
      if (!order.scheduled_at) return []
      const scheduledAt = new Date(order.scheduled_at)
      if (Number.isNaN(scheduledAt.getTime())) return []
      return [{ order, dateKey: toDateKey(scheduledAt), timeLabel: new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(scheduledAt) }]
    }),
  )

  const eventsByDate = computed(() => {
    const grouped: Record<string, ScheduleEvent[]> = {}
    events.value.forEach((event) => {
      const dayEvents = grouped[event.dateKey] || (grouped[event.dateKey] = [])
      dayEvents.push(event)
    })
    Object.values(grouped).forEach((dayEvents) => dayEvents.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel)))
    return grouped
  })

  const monthLabel = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(currentMonth.value))
  const fetchSchedule = async () => {
    controller?.abort()
    const nextController = new AbortController()
    controller = nextController
    loading.value = true
    errorMessage.value = ''
    try {
      const data: MaintenanceOrderPage = await maintenanceOrdersApi.index(
        { search: '', status: '', page: 1, per_page: 100 },
        { signal: nextController.signal },
      )
      orders.value = data.items
    } catch (error) {
      if (!isCanceledRequest(error)) errorMessage.value = normalizeApiError(error).message
    } finally {
      if (controller === nextController) {
        controller = null
        loading.value = false
      }
    }
  }

  const goToMonth = (offset: number) => {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + offset, 1)
  }

  const goToToday = () => {
    const today = new Date()
    currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
    selectedDay.value = toDateKey(today)
  }

  const selectDay = (dateKey: string) => {
    selectedDay.value = dateKey
    const date = new Date(`${dateKey}T12:00:00`)
    if (!Number.isNaN(date.getTime())) currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }

  onMounted(() => void fetchSchedule())
  onBeforeUnmount(() => {
    controller?.abort()
    controller = null
  })

  return { orders, events, eventsByDate, currentMonth, selectedDay, monthLabel, loading, errorMessage, fetchSchedule, goToMonth, goToToday, selectDay }
}

export { toDateKey }
