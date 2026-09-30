<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiAlertOutline,
  mdiCalendarCheckOutline,
  mdiCalendarMonthOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClockOutline,
  mdiMagnify,
  mdiMapMarkerOutline,
  mdiRefresh,
  mdiTuneVariant,
} from '@mdi/js'
import { useMaintenanceSchedule, toDateKey, type ScheduleEvent } from '@/modules/maintenance-orders/composables/useMaintenanceSchedule'
import { useModelFilterOptions } from '@/modules/shared/composables/useModelFilterOptions'
import { MAINTENANCE_ORDER_STATUSES, ORDER_STATUS_LABELS, type MaintenanceOrder } from '@/types/maintenanceOrder'

interface CalendarDay {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

const { locale } = useI18n()
const search = ref('')
const statusFilter = ref('')
const workshopFilter = ref('')

const {
  currentMonth,
  errorMessage,
  events,
  fetchSchedule,
  loading,
  monthLabel,
  selectedDay,
  selectDay,
  goToMonth,
  goToToday,
  orders,
} = useMaintenanceSchedule()

const statusOptions = [
  { title: 'Todos los estados', value: '' },
  ...MAINTENANCE_ORDER_STATUSES.map((value) => ({ title: ORDER_STATUS_LABELS[value], value })),
]
const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const todayKey = toDateKey(new Date())

const { loading: loadingModelOptions, workshopOptions } = useModelFilterOptions({ workshops: true })

const normalizedSearch = computed(() => search.value.trim().toLowerCase())
const filteredEvents = computed(() => events.value.filter((event) => {
  const order = event.order
  const searchable = [
    `ot-${String(order.id).padStart(5, '0')}`,
    order.vehicle?.license_plate,
    order.vehicle?.brand,
    order.vehicle?.model,
    order.workshop?.name,
    order.owner?.name,
  ].filter(Boolean).join(' ').toLowerCase()
  return (!normalizedSearch.value || searchable.includes(normalizedSearch.value)) &&
    (!statusFilter.value || order.status === statusFilter.value) &&
    (!workshopFilter.value || String(order.workshop?.id) === workshopFilter.value)
}))
const eventsByDate = computed(() => {
  const grouped: Record<string, ScheduleEvent[]> = {}
  filteredEvents.value.forEach((event) => {
    const dayEvents = grouped[event.dateKey] || (grouped[event.dateKey] = [])
    dayEvents.push(event)
  })
  return grouped
})
const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - firstDayOffset + 1)
    const dateKey = toDateKey(date)
    return { dateKey, dayNumber: date.getDate(), isCurrentMonth: date.getMonth() === month, isToday: dateKey === todayKey }
  })
})
const selectedEvents = computed(() => eventsByDate.value[selectedDay.value] ?? [])
const selectedDateLabel = computed(() => new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${selectedDay.value}T12:00:00`)))
const currentMonthEvents = computed(() => filteredEvents.value.filter((event) => {
  const date = new Date(`${event.dateKey}T12:00:00`)
  return date.getFullYear() === currentMonth.value.getFullYear() && date.getMonth() === currentMonth.value.getMonth()
}))
const todayEvents = computed(() => filteredEvents.value.filter((event) => event.dateKey === todayKey))
const activeOrders = computed(() => orders.value.filter((order) => ['in_progress', 'scheduled'].includes(order.status)).length)

const changeMonth = (offset: number) => {
  goToMonth(offset)
  const monthDate = currentMonth.value
  selectDay(toDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)))
}
const resetFilters = () => {
  search.value = ''
  statusFilter.value = ''
  workshopFilter.value = ''
}
const orderNumber = (order: MaintenanceOrder) => `OT-${String(order.id).padStart(5, '0')}`
const vehicleLabel = (order: MaintenanceOrder) => [order.vehicle?.brand, order.vehicle?.model].filter(Boolean).join(' ') || `Vehículo ${order.vehicle_id}`
const workshopLabel = (order: MaintenanceOrder) => order.workshop?.name || 'Taller pendiente'
const statusLabel = (status: string) => ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || 'Estado actualizado'
const statusColor = (status: string) => ({ scheduled: '#397eea', in_progress: '#d58930', completed: '#239878', pending_owner_approval: '#d58930', cancelled: '#dc5967' }[status] || '#7c8ba6')
const formatSelectedDate = (value: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`))

</script>

<template>
  <section id="agenda-operativa" class="dashboard-feature-section dashboard-schedule-section">
    <div class="dashboard-section-heading dashboard-schedule-heading">
      <div><span class="page-date">Planificación de mantenimiento</span><h2>Agenda operativa</h2><p>Coordina las órdenes programadas y visualiza la carga de trabajo del equipo.</p></div>
      <v-btn :loading="loading" height="42" variant="outlined" @click="fetchSchedule"><v-icon :icon="mdiRefresh" class="mr-2" size="18" /> Actualizar</v-btn>
    </div>

        <section class="maintenance-schedule-metrics">
          <article><span class="maintenance-schedule-metric__icon maintenance-schedule-metric__icon--blue"><v-icon :icon="mdiCalendarMonthOutline" size="20" /></span><div><strong>{{ currentMonthEvents.length }}</strong><span>órdenes este mes</span></div></article>
          <article><span class="maintenance-schedule-metric__icon maintenance-schedule-metric__icon--teal"><v-icon :icon="mdiCalendarCheckOutline" size="20" /></span><div><strong>{{ todayEvents.length }}</strong><span>programadas hoy</span></div></article>
          <article><span class="maintenance-schedule-metric__icon maintenance-schedule-metric__icon--amber"><v-icon :icon="mdiClockOutline" size="20" /></span><div><strong>{{ activeOrders }}</strong><span>órdenes en atención</span></div></article>
        </section>

        <section class="maintenance-schedule-panel dashboard-feature-panel">
          <div class="maintenance-schedule-panel__heading"><div><h2>Calendario de órdenes</h2><p>Selecciona un día para consultar las órdenes programadas.</p></div><v-icon :icon="mdiTuneVariant" color="#8290aa" size="21" /></div>
          <form class="maintenance-schedule-filters" @submit.prevent>
            <v-text-field v-model="search" clearable hide-details label="Buscar" placeholder="Orden, placa, vehículo o taller" :prepend-inner-icon="mdiMagnify" />
            <v-select v-model="statusFilter" hide-details item-title="title" item-value="value" label="Estado" :items="statusOptions" />
            <v-select v-model="workshopFilter" clearable hide-details item-title="title" item-value="value" label="Taller" :items="workshopOptions" :loading="loadingModelOptions" placeholder="Todos los talleres" />
            <v-btn variant="text" type="button" @click="resetFilters">Limpiar</v-btn>
          </form>
          <v-alert v-if="errorMessage" class="maintenance-schedule-alert" type="error" variant="tonal"><span>{{ errorMessage }}</span><template #append><v-btn size="small" variant="text" @click="fetchSchedule">Reintentar</v-btn></template></v-alert>

          <div class="maintenance-schedule-layout">
            <div class="maintenance-schedule-calendar">
              <div class="maintenance-schedule-calendar__toolbar"><div><button type="button" aria-label="Mes anterior" @click="changeMonth(-1)"><v-icon :icon="mdiChevronLeft" size="18" /></button><button type="button" aria-label="Mes siguiente" @click="changeMonth(1)"><v-icon :icon="mdiChevronRight" size="18" /></button><strong>{{ monthLabel }}</strong></div><v-btn size="small" variant="tonal" @click="goToToday">Hoy</v-btn></div>
              <div class="maintenance-schedule-weekdays"><span v-for="day in weekDays" :key="day">{{ day }}</span></div>
              <div class="maintenance-schedule-grid">
                <button
                  v-for="day in calendarDays"
                  :key="day.dateKey"
                  :class="['maintenance-schedule-day', { 'maintenance-schedule-day--outside': !day.isCurrentMonth, 'maintenance-schedule-day--today': day.isToday, 'maintenance-schedule-day--selected': selectedDay === day.dateKey }]"
                  type="button"
                  @click="selectDay(day.dateKey)"
                >
                  <span class="maintenance-schedule-day__number">{{ day.dayNumber }}</span>
                  <span v-for="event in (eventsByDate[day.dateKey] || []).slice(0, 2)" :key="event.order.id" class="maintenance-schedule-day__event" :style="{ '--event-color': statusColor(event.order.status) }"><b>{{ event.timeLabel }}</b> {{ orderNumber(event.order) }}</span>
                  <span v-if="(eventsByDate[day.dateKey]?.length || 0) > 2" class="maintenance-schedule-day__more">+{{ (eventsByDate[day.dateKey]?.length || 0) - 2 }} más</span>
                </button>
              </div>
            </div>

            <aside class="maintenance-schedule-day-panel">
              <div class="maintenance-schedule-day-panel__heading"><span class="maintenance-schedule-day-panel__date">{{ formatSelectedDate(selectedDay) }}</span><h2>{{ selectedDateLabel }}</h2><p>{{ selectedEvents.length }} {{ selectedEvents.length === 1 ? 'orden programada' : 'órdenes programadas' }}</p></div>
              <div v-if="selectedEvents.length" class="maintenance-schedule-events">
                <router-link v-for="event in selectedEvents" :key="event.order.id" class="maintenance-schedule-event" :to="{ name: 'orders-detail', params: { id: event.order.id } }">
                  <span class="maintenance-schedule-event__time">{{ event.timeLabel }}</span>
                  <span class="maintenance-schedule-event__body"><strong>{{ orderNumber(event.order) }}</strong><span>{{ vehicleLabel(event.order) }}</span><small><v-icon :icon="mdiMapMarkerOutline" size="13" />{{ workshopLabel(event.order) }}</small></span>
                  <v-chip label size="x-small" :color="statusColor(event.order.status)" variant="tonal">{{ statusLabel(event.order.status) }}</v-chip>
                </router-link>
              </div>
              <div v-else class="maintenance-schedule-day-panel__empty"><v-icon :icon="mdiAlertOutline" size="26" /><strong>Sin órdenes programadas</strong><span>Selecciona otro día o ajusta los filtros del calendario.</span></div>
            </aside>
          </div>

          <div class="maintenance-schedule-legend"><span><i style="--legend-color: #397eea" />Programada</span><span><i style="--legend-color: #d58930" />En atención</span><span><i style="--legend-color: #239878" />Completada</span><span><i style="--legend-color: #dc5967" />Cancelada</span></div>
        </section>
  </section>
</template>

<style src="@/styles/views/maintenance-schedule.scss" lang="scss"></style>
