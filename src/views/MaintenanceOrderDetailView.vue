<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCancel,
  mdiCalendarClockOutline,
  mdiCalendarOutline,
  mdiCarMultiple,
  mdiClipboardCheckOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiDeleteOutline,
  mdiMapMarkerOutline,
  mdiPlus,
  mdiPlayCircleOutline,
  mdiRefresh,
  mdiTuneVariant,
  mdiTruckDeliveryOutline,
  mdiAccountGroupOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError } from '@/api/errors'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceOrderDetail } from '@/modules/maintenance-orders/composables/useMaintenanceOrderDetail'
import { useMaintenanceOrderRealtimeRefresh } from '@/modules/realtime/composables/useMaintenanceOrderRealtimeRefresh'
import { maintenanceOrderIdForEvent } from '@/modules/realtime/services/operationalEventsService'
import {
  ORDER_STATUS_LABELS,
  ORDER_ITEM_STATUS_LABELS,
  type MaintenanceOrder,
  type MaintenanceOrderItem,
  type MaintenanceOrderAssignmentPayload,
  type MaintenanceOrderPerson,
  type MaintenanceOrderWorkshop,
  type MaintenanceOrderItemsPayload,
} from '@/types/maintenanceOrder'
import type { MaintenancePlan, MaintenanceTask } from '@/types/maintenancePlan'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService'
import usersApi from '@/modules/users/services/usersService'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import {
  orderItemStatusActions,
  orderStatusActions,
  type MaintenanceOrderAction,
  type MaintenanceOrderItemAction,
} from '@/modules/maintenance-orders/utils/orderStatusRules'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)

const orderId = computed(() => String(route.params.id ?? ''))
const {
  errorMessage,
  fetchOrder,
  loading,
  order,
  updateItemStatus,
  updateOrderStatus,
  updatingStatus,
  assignOrder,
  updatingAssignment,
  addItems,
  removeItem,
  updatingItems,
} = useMaintenanceOrderDetail(orderId)

useMaintenanceOrderRealtimeRefresh(
  fetchOrder,
  (event) => String(maintenanceOrderIdForEvent(event)) === orderId.value,
)

const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const pageTitle = computed(() => (order.value ? orderNumber(order.value) : 'Detalle de orden'))

const availableActions = computed(() =>
  order.value
    ? orderStatusActions(order.value, authStore.user?.roles ?? [], authStore.user)
    : [],
)

type SelectedTransition =
  | { type: 'order'; action: MaintenanceOrderAction }
  | { type: 'item'; action: MaintenanceOrderItemAction; itemId: number }

const selectedTransition = ref<SelectedTransition | null>(null)
const actionDialog = ref(false)
const assignmentDialog = ref(false)
const assignmentError = ref('')
const loadingAssignmentOptions = ref(false)
const workshops = ref<MaintenanceOrderWorkshop[]>([])
const technicians = ref<MaintenanceOrderPerson[]>([])
const assignmentForm = reactive({
  workshop_id: null as number | null,
  technician_id: null as number | null,
  scheduled_at: '',
})
const activityDialog = ref(false)
const activityError = ref('')
const loadingActivityOptions = ref(false)
const plans = ref<MaintenancePlan[]>([])
const selectedPlanId = ref<number | null>(null)
const selectedTaskIds = ref<number[]>([])
const removeItemDialog = ref(false)
const selectedItem = ref<MaintenanceOrderItem | null>(null)

const actionLabels: Record<MaintenanceOrderAction | MaintenanceOrderItemAction, string> = {
  approved: 'Aprobar orden',
  rejected: 'Rechazar orden',
  cancelled: 'Cancelar orden',
  delivered: 'Marcar como entregada',
  in_progress: 'Iniciar actividad',
  completed: 'Completar actividad',
}

const actionDescriptions: Record<MaintenanceOrderAction | MaintenanceOrderItemAction, string> = {
  approved: 'La orden quedará aprobada y podrá continuar con su proceso operativo.',
  rejected: 'La orden quedará rechazada y no continuará al siguiente paso.',
  cancelled: 'La orden quedará cancelada y esta acción no se puede deshacer.',
  delivered: 'La orden quedará registrada como entregada al propietario.',
  in_progress: 'La actividad comenzará y quedará marcada como trabajo en curso.',
  completed: 'La actividad quedará registrada como finalizada.',
}

const actionIcons: Record<MaintenanceOrderAction | MaintenanceOrderItemAction, string> = {
  approved: mdiCheckCircleOutline,
  rejected: mdiCancel,
  cancelled: mdiCancel,
  delivered: mdiTruckDeliveryOutline,
  in_progress: mdiPlayCircleOutline,
  completed: mdiClipboardCheckOutline,
}

const actionColors: Record<MaintenanceOrderAction | MaintenanceOrderItemAction, string> = {
  approved: 'success',
  rejected: 'error',
  cancelled: 'error',
  delivered: 'primary',
  in_progress: 'primary',
  completed: 'success',
}

const canSchedule = computed(() => {
  const roles = authStore.user?.roles ?? []
  const activeOrder = order.value

  return Boolean(
    activeOrder &&
      ['super_admin', 'admin', 'workshop_manager'].some((role) => roles.includes(role)) &&
      !['rejected', 'cancelled', 'delivered', 'completed'].includes(activeOrder.status),
  )
})

const workshopOptions = computed(() =>
  workshops.value.map((workshop) => ({
    ...workshop,
    title: [workshop.code, workshop.name].filter(Boolean).join(' · '),
    subtitle: workshop.city || 'Ciudad pendiente',
  })),
)

const technicianOptions = computed(() =>
  technicians.value.map((technician) => ({
    ...technician,
    title: technician.name || `Usuario ${technician.id}`,
    subtitle: technician.email || 'Sin correo registrado',
  })),
)

const canManageItems = computed(() => {
  const roles = authStore.user?.roles ?? []
  const activeOrder = order.value
  return Boolean(
    activeOrder &&
      ['super_admin', 'admin', 'advisor', 'workshop_manager'].some((role) => roles.includes(role)) &&
      !['rejected', 'cancelled', 'delivered', 'completed'].includes(activeOrder.status),
  )
})

const planOptions = computed(() =>
  plans.value.map((maintenancePlan) => ({
    ...maintenancePlan,
    title: [maintenancePlan.code, maintenancePlan.name].filter(Boolean).join(' · '),
    subtitle: `${maintenancePlan.tasks?.length ?? maintenancePlan.tasks_count ?? 0} actividades · ${maintenancePlan.interval_km ? `${maintenancePlan.interval_km.toLocaleString('es-CO')} km` : 'frecuencia definida'}`,
  })),
)

const selectedPlan = computed(() => plans.value.find((maintenancePlan) => maintenancePlan.id === selectedPlanId.value) ?? null)
const availablePlanTasks = computed<MaintenanceTask[]>(() => {
  const existingTaskIds = new Set(
    (order.value?.items ?? []).map((item) => item.maintenance_task_id).filter((id): id is number => Boolean(id)),
  )
  return (selectedPlan.value?.tasks ?? []).filter((task) => !existingTaskIds.has(task.id) && task.is_active !== false)
})

const requestStatusChange = (action: MaintenanceOrderAction) => {
  selectedTransition.value = { type: 'order', action }
  actionDialog.value = true
  errorMessage.value = ''
}

const availableItemActions = (item: MaintenanceOrderItem) =>
  order.value
    ? orderItemStatusActions(item, order.value, authStore.user?.roles ?? [], authStore.user)
    : []

const requestItemStatusChange = (action: MaintenanceOrderItemAction, item: MaintenanceOrderItem) => {
  selectedTransition.value = { type: 'item', action, itemId: item.id }
  actionDialog.value = true
  errorMessage.value = ''
}

const closeActionDialog = () => {
  if (!updatingStatus.value) {
    actionDialog.value = false
    selectedTransition.value = null
  }
}

const confirmStatusChange = async () => {
  if (!selectedTransition.value) {
    return
  }

  const transition = selectedTransition.value
  const updated =
    transition.type === 'order'
      ? await updateOrderStatus(transition.action)
      : await updateItemStatus(transition.itemId, transition.action)

  if (updated) {
    actionDialog.value = false
    selectedTransition.value = null
  }
}

const toDateTimeInput = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const loadAssignmentOptions = async () => {
  loadingAssignmentOptions.value = true
  assignmentError.value = ''

  try {
    const [workshopPage, technicianPage] = await Promise.all([
      workshopsApi.index({ is_active: true, page: 1, per_page: 100 }),
      usersApi.technicians(),
    ])
    workshops.value = workshopPage.items
    technicians.value = technicianPage.items
  } catch (error) {
    assignmentError.value = normalizeApiError(error).message
  } finally {
    loadingAssignmentOptions.value = false
  }
}

const openAssignmentDialog = async () => {
  if (!order.value) return
  assignmentError.value = ''
  assignmentForm.workshop_id = order.value.workshop?.id ?? null
  assignmentForm.technician_id = order.value.technician?.id ?? null
  assignmentForm.scheduled_at = toDateTimeInput(order.value.scheduled_at)
  assignmentDialog.value = true

  if (workshops.value.length === 0 || technicians.value.length === 0) {
    await loadAssignmentOptions()
  }
}

const closeAssignmentDialog = () => {
  if (!updatingAssignment.value) assignmentDialog.value = false
}

const confirmAssignment = async () => {
  assignmentError.value = ''
  if (!assignmentForm.workshop_id) {
    assignmentError.value = 'Selecciona el taller responsable.'
    return
  }
  if (!assignmentForm.scheduled_at) {
    assignmentError.value = 'Selecciona la fecha y hora de atención.'
    return
  }

  const payload: MaintenanceOrderAssignmentPayload = {
    workshop_id: Number(assignmentForm.workshop_id),
    technician_id: assignmentForm.technician_id ? Number(assignmentForm.technician_id) : null,
    scheduled_at: new Date(assignmentForm.scheduled_at).toISOString(),
  }
  const updated = await assignOrder(payload)
  if (updated) assignmentDialog.value = false
}

const loadActivityOptions = async () => {
  loadingActivityOptions.value = true
  activityError.value = ''
  try {
    plans.value = (await maintenancePlansApi.index({ status: 'active', page: 1, per_page: 100 })).items
  } catch (error) {
    activityError.value = normalizeApiError(error).message
  } finally {
    loadingActivityOptions.value = false
  }
}

const openActivityDialog = async () => {
  activityError.value = ''
  selectedPlanId.value = null
  selectedTaskIds.value = []
  activityDialog.value = true
  if (plans.value.length === 0) await loadActivityOptions()
}

const closeActivityDialog = () => {
  if (!updatingItems.value) activityDialog.value = false
}

const confirmAddItems = async () => {
  activityError.value = ''
  if (!selectedPlanId.value) {
    activityError.value = 'Selecciona un plan de mantenimiento.'
    return
  }
  if (selectedTaskIds.value.length === 0) {
    activityError.value = 'Selecciona al menos una actividad para agregar.'
    return
  }

  const payload: MaintenanceOrderItemsPayload = {
    maintenance_plan_id: selectedPlanId.value,
    maintenance_task_ids: selectedTaskIds.value,
  }
  const updated = await addItems(payload)
  if (updated) activityDialog.value = false
}

const canRemoveItem = (item: MaintenanceOrderItem) =>
  canManageItems.value && !['in_progress', 'completed', 'rejected', 'cancelled'].includes(item.status || '')

const requestRemoveItem = (item: MaintenanceOrderItem) => {
  selectedItem.value = item
  removeItemDialog.value = true
  errorMessage.value = ''
}

const closeRemoveItemDialog = () => {
  if (!updatingItems.value) {
    removeItemDialog.value = false
    selectedItem.value = null
  }
}

const confirmRemoveItem = async () => {
  if (!selectedItem.value) return
  const removed = await removeItem(selectedItem.value.id)
  if (removed) closeRemoveItemDialog()
}

const orderNumber = (currentOrder: MaintenanceOrder) =>
  `OT-${String(currentOrder.id).padStart(5, '0')}`

const vehicleName = (currentOrder: MaintenanceOrder) =>
  [currentOrder.vehicle?.brand, currentOrder.vehicle?.model]
    .filter(Boolean)
    .join(' ') || `Vehículo ${currentOrder.vehicle_id}`

const vehiclePlate = (currentOrder: MaintenanceOrder) =>
  currentOrder.vehicle?.license_plate || 'Placa pendiente'

const personName = (person?: MaintenanceOrder['owner']) => person?.name || 'Sin asignar'

const workshopName = (currentOrder: MaintenanceOrder) =>
  currentOrder.workshop
    ? [currentOrder.workshop.code, currentOrder.workshop.name].filter(Boolean).join(' · ')
    : 'Sin taller asignado'

const statusLabel = (status?: string | null) =>
  status
    ? ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ||
      ORDER_ITEM_STATUS_LABELS[status as keyof typeof ORDER_ITEM_STATUS_LABELS] ||
      'Estado actualizado'
    : 'Sin estado'

const statusColor = (status?: string | null) => {
  const colors: Record<string, string> = {
    created: '#7c8ba6',
    pending_owner_approval: '#d58930',
    approved: '#397eea',
    partially_approved: '#397eea',
    rejected: '#dc5967',
    scheduled: '#397eea',
    in_progress: '#d58930',
    completed: '#239878',
    delivered: '#239878',
    cancelled: '#dc5967',
  }

  return colors[status || ''] || '#7c8ba6'
}

const formatDateTime = (value?: string | null, emptyLabel = 'Sin registrar') => {
  if (!value) {
    return emptyLabel
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const itemTaskName = (item: MaintenanceOrderItem) =>
  [item.maintenance_task?.code, item.maintenance_task?.name].filter(Boolean).join(' · ') ||
  `Actividad ${item.maintenance_task_id ?? item.id}`

const itemPlanName = (item: MaintenanceOrderItem) =>
  item.maintenance_plan
    ? [item.maintenance_plan.code, item.maintenance_plan.name].filter(Boolean).join(' · ')
    : 'Sin plan'

const itemSystemName = (item: MaintenanceOrderItem) =>
  item.maintenance_task?.vehicle_system?.name || 'Sin sistema'

const itemDuration = (item: MaintenanceOrderItem) => {
  const duration = item.planned_duration_minutes ?? item.maintenance_task?.estimated_duration_minutes

  return duration ? `${new Intl.NumberFormat('es-CO').format(duration)} min` : 'Sin estimar'
}

const itemStatusColor = (status?: string | null) => {
  if (status === 'completed') {
    return '#239878'
  }

  if (status === 'in_progress') {
    return '#d58930'
  }

  if (status === 'rejected' || status === 'cancelled') {
    return '#dc5967'
  }

  return '#397eea'
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="orders-shell order-detail-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      context="Detalle de orden"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="orders-main">
      <div class="orders-content order-detail-content">
        <div class="detail-breadcrumbs">
          <router-link :to="{ name: 'orders' }">Órdenes de mantenimiento</router-link>
          <v-icon :icon="mdiArrowLeft" class="detail-breadcrumbs__arrow" size="14" />
          <span>{{ pageTitle }}</span>
        </div>

        <header class="order-detail-header">
          <div>
            <span class="page-date">Orden de trabajo</span>
            <h1>{{ pageTitle }}</h1>
            <p>Consulta el estado y el detalle operativo de esta orden.</p>
          </div>
          <v-btn
            :to="{ name: 'orders' }"
            class="orders-refresh"
            height="42"
            variant="outlined"
          >
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Volver al listado
          </v-btn>
        </header>

        <v-alert v-if="errorMessage" class="orders-alert detail-alert" type="error" variant="tonal">
          <span>{{ errorMessage }}</span>
          <template #append>
            <v-btn :loading="loading" size="small" variant="text" @click="fetchOrder">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="detail-loading">
          <v-skeleton-loader type="article, table-tbody" />
        </section>

        <section v-else-if="!order" class="detail-empty">
          <v-icon :icon="mdiAlertOutline" color="error" size="34" />
          <strong>No fue posible encontrar esta orden</strong>
          <span>Regresa al listado para seleccionar otra orden de mantenimiento.</span>
          <v-btn color="primary" :to="{ name: 'orders' }">Ver órdenes</v-btn>
        </section>

        <template v-else>
          <section class="order-detail-hero">
            <div class="order-detail-hero__vehicle">
              <span class="order-detail-hero__icon">
                <v-icon :icon="mdiCarMultiple" size="28" />
              </span>
              <div>
                <span class="detail-overline">Vehículo asociado</span>
                <h2>{{ vehicleName(order) }}</h2>
                <p>{{ vehiclePlate(order) }}</p>
              </div>
            </div>
            <div class="order-detail-hero__status">
              <span class="detail-overline">Estado actual</span>
              <v-chip label size="small" :color="statusColor(order.status)" variant="tonal">
                {{ statusLabel(order.status) }}
              </v-chip>
            </div>
            <div class="order-detail-hero__items">
              <span class="detail-overline">Actividades</span>
              <strong>{{ order.items?.length ?? 0 }}</strong>
              <span>registradas</span>
            </div>
          </section>

          <section v-if="availableActions.length || canSchedule" class="detail-actions-bar">
            <div>
              <span class="detail-overline">Acciones disponibles</span>
              <p>Gestiona el siguiente paso de esta orden.</p>
            </div>
            <div class="detail-actions-bar__buttons">
              <v-btn
                v-if="canSchedule"
                color="primary"
                :disabled="updatingStatus || updatingAssignment"
                variant="tonal"
                @click="openAssignmentDialog"
              >
                <v-icon :icon="mdiCalendarClockOutline" class="mr-2" size="16" />
                Programar y asignar
              </v-btn>
              <v-btn
                v-for="action in availableActions"
                :key="action"
                :color="actionColors[action]"
                :disabled="updatingStatus || updatingAssignment"
                variant="tonal"
                @click="requestStatusChange(action)"
              >
                <v-icon :icon="actionIcons[action]" class="mr-2" size="16" />
                {{ actionLabels[action] }}
              </v-btn>
            </div>
          </section>

          <section class="detail-info-grid">
            <article class="detail-card">
              <div class="detail-card__heading">
                <span class="detail-card__icon detail-card__icon--blue">
                  <v-icon :icon="mdiAccountGroupOutline" size="18" />
                </span>
                <div><h2>Responsables</h2><p>Personas asignadas a la orden</p></div>
              </div>
              <dl class="detail-definition-list">
                <div><dt>Propietario</dt><dd>{{ personName(order.owner) }}</dd></div>
                <div><dt>Asesor</dt><dd>{{ personName(order.advisor) }}</dd></div>
                <div><dt>Técnico</dt><dd>{{ personName(order.technician) }}</dd></div>
              </dl>
            </article>

            <article class="detail-card">
              <div class="detail-card__heading">
                <span class="detail-card__icon detail-card__icon--teal">
                  <v-icon :icon="mdiWrenchOutline" size="18" />
                </span>
                <div><h2>Ubicación de servicio</h2><p>Taller responsable de la atención</p></div>
              </div>
              <div class="detail-location">
                <strong>{{ workshopName(order) }}</strong>
                <span v-if="order.workshop?.city"><v-icon :icon="mdiMapMarkerOutline" size="15" />{{ order.workshop.city }}</span>
                <span v-else>Ubicación pendiente de asignar</span>
              </div>
            </article>

            <article class="detail-card">
              <div class="detail-card__heading">
                <span class="detail-card__icon detail-card__icon--amber">
                  <v-icon :icon="mdiCalendarClockOutline" size="18" />
                </span>
                <div><h2>Línea de tiempo</h2><p>Fechas relevantes del proceso</p></div>
              </div>
              <dl class="detail-definition-list detail-definition-list--compact">
                <div><dt>Creada</dt><dd>{{ formatDateTime(order.created_at) }}</dd></div>
                <div><dt>Programada</dt><dd>{{ formatDateTime(order.scheduled_at) }}</dd></div>
                <div><dt>Actualizada</dt><dd>{{ formatDateTime(order.updated_at) }}</dd></div>
              </dl>
            </article>
          </section>

          <section class="detail-card detail-activities-card">
            <div class="detail-card__heading detail-card__heading--table">
              <div class="detail-card__heading-main">
                <span class="detail-card__icon detail-card__icon--blue">
                  <v-icon :icon="mdiClipboardCheckOutline" size="18" />
                </span>
                <div><h2>Actividades de mantenimiento</h2><p>Trabajos incluidos en esta orden</p></div>
              </div>
              <div class="detail-activities-header__actions">
                <span class="detail-count">{{ order.items?.length ?? 0 }} actividades</span>
                <v-btn v-if="canManageItems" color="primary" size="small" variant="tonal" @click="openActivityDialog">
                  <v-icon :icon="mdiPlus" class="mr-1" size="15" /> Agregar actividades
                </v-btn>
              </div>
            </div>

            <div v-if="order.items?.length" class="detail-items-wrap">
              <table class="detail-items-table">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Plan</th>
                    <th>Sistema</th>
                    <th>Estado</th>
                    <th>Duración</th>
                    <th>Programada</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.items" :key="item.id">
                    <td><strong>{{ itemTaskName(item) }}</strong><small>Actividad #{{ item.id }}</small></td>
                    <td>{{ itemPlanName(item) }}</td>
                    <td>{{ itemSystemName(item) }}</td>
                    <td>
                      <v-chip label size="small" :color="itemStatusColor(item.status)" variant="tonal">
                        {{ statusLabel(item.status) }}
                      </v-chip>
                    </td>
                    <td><span class="detail-table-muted">{{ itemDuration(item) }}</span></td>
                    <td><span class="detail-table-muted">{{ formatDateTime(item.scheduled_at) }}</span></td>
                    <td>
                      <div v-if="availableItemActions(item).length || canRemoveItem(item)" class="item-actions">
                        <v-btn
                          v-for="action in availableItemActions(item)"
                          :key="action"
                          :aria-label="actionLabels[action]"
                          :color="actionColors[action]"
                          :disabled="updatingStatus"
                          icon
                          size="x-small"
                          variant="tonal"
                          @click="requestItemStatusChange(action, item)"
                        >
                          <v-icon :icon="actionIcons[action]" size="15" />
                        </v-btn>
                        <v-btn
                          v-if="canRemoveItem(item)"
                          aria-label="Eliminar actividad"
                          color="error"
                          icon
                          size="x-small"
                          variant="tonal"
                          @click="requestRemoveItem(item)"
                        >
                          <v-icon :icon="mdiDeleteOutline" size="15" />
                        </v-btn>
                      </div>
                      <span v-else class="detail-table-muted">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="detail-items-empty">
              <v-icon :icon="mdiTuneVariant" size="26" />
              <strong>Esta orden aún no tiene actividades</strong>
              <span>Las actividades aparecerán aquí cuando sean asignadas.</span>
            </div>
          </section>

          <section class="detail-footer-meta">
            <span><v-icon :icon="mdiCalendarOutline" size="15" /> Creada {{ formatDateTime(order.created_at) }}</span>
            <span><v-icon :icon="mdiClockOutline" size="15" /> Última actualización {{ formatDateTime(order.updated_at) }}</span>
          </section>
        </template>
      </div>
    </v-main>

    <v-dialog v-model="actionDialog" max-width="430" @update:model-value="closeActionDialog">
      <v-card class="status-dialog">
        <v-card-title>
          ¿{{ selectedTransition ? actionLabels[selectedTransition.action] : 'Actualizar orden' }}?
        </v-card-title>
        <v-card-text>
          {{ selectedTransition ? actionDescriptions[selectedTransition.action] : '' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="updatingStatus" @click="closeActionDialog">Cancelar</v-btn>
          <v-btn
            :color="selectedTransition ? actionColors[selectedTransition.action] : 'primary'"
            :loading="updatingStatus"
            @click="confirmStatusChange"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="assignmentDialog" max-width="620" @update:model-value="closeAssignmentDialog">
      <v-card class="assignment-dialog">
        <v-card-title>Programar y asignar orden</v-card-title>
        <v-card-text>
          <p class="assignment-dialog__intro">Define el centro de servicio, el técnico responsable y el momento de atención.</p>
          <v-alert v-if="assignmentError" class="assignment-dialog__alert" type="error" variant="tonal">{{ assignmentError }}</v-alert>
          <div class="assignment-dialog__fields">
            <v-autocomplete
              v-model="assignmentForm.workshop_id"
              item-title="title"
              item-value="id"
              label="Taller responsable"
              :items="workshopOptions"
              :loading="loadingAssignmentOptions"
              placeholder="Selecciona un taller"
              clearable
              variant="outlined"
            />
            <v-autocomplete
              v-model="assignmentForm.technician_id"
              item-title="title"
              item-value="id"
              label="Técnico asignado"
              :items="technicianOptions"
              :loading="loadingAssignmentOptions"
              placeholder="Selecciona un técnico"
              clearable
              variant="outlined"
            />
            <v-text-field v-model="assignmentForm.scheduled_at" label="Fecha y hora de atención" type="datetime-local" variant="outlined" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="updatingAssignment" @click="closeAssignmentDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="updatingAssignment" :disabled="loadingAssignmentOptions" @click="confirmAssignment">Guardar programación</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="activityDialog" max-width="700" @update:model-value="closeActivityDialog">
      <v-card class="activity-dialog">
        <v-card-title>Agregar actividades a la orden</v-card-title>
        <v-card-text>
          <p class="activity-dialog__intro">Selecciona un plan y las tareas que deben incorporarse a {{ order ? orderNumber(order) : 'esta orden' }}.</p>
          <v-alert v-if="activityError" class="activity-dialog__alert" type="error" variant="tonal">{{ activityError }}</v-alert>
          <v-autocomplete
            v-model="selectedPlanId"
            class="activity-dialog__plan"
            item-title="title"
            item-value="id"
            label="Plan de mantenimiento"
            :items="planOptions"
            :loading="loadingActivityOptions"
            placeholder="Selecciona un plan preventivo"
            clearable
            variant="outlined"
          >
            <template #item="{ props, item }"><v-list-item v-bind="props" :subtitle="item.raw.subtitle" /></template>
          </v-autocomplete>
          <div v-if="selectedPlan" class="activity-dialog__tasks">
            <div class="activity-dialog__tasks-heading"><strong>Actividades disponibles</strong><span>{{ selectedTaskIds.length }} seleccionadas</span></div>
            <div v-if="availablePlanTasks.length" class="activity-dialog__task-list">
              <v-checkbox
                v-for="task in availablePlanTasks"
                :key="task.id"
                v-model="selectedTaskIds"
                color="primary"
                hide-details
                :label="task.name"
                :value="task.id"
              >
                <template #label><span><strong>{{ task.name }}</strong><small>{{ task.code }} · {{ task.estimated_duration_minutes || '—' }} min{{ task.vehicle_system?.name ? ` · ${task.vehicle_system.name}` : '' }}</small></span></template>
              </v-checkbox>
            </div>
            <div v-else class="activity-dialog__empty">Todas las actividades de este plan ya están incluidas en la orden.</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="updatingItems" @click="closeActivityDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="updatingItems" :disabled="loadingActivityOptions || !selectedPlan" @click="confirmAddItems">Agregar seleccionadas</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeItemDialog" max-width="430" @update:model-value="closeRemoveItemDialog">
      <v-card class="remove-item-dialog">
        <v-card-title>¿Eliminar esta actividad?</v-card-title>
        <v-card-text>{{ selectedItem?.maintenance_task?.name || 'La actividad seleccionada' }} se quitará de esta orden mientras no haya iniciado su ejecución.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="updatingItems" @click="closeRemoveItemDialog">Cancelar</v-btn>
          <v-btn color="error" :loading="updatingItems" @click="confirmRemoveItem">Eliminar actividad</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style src="@/styles/views/order-detail.scss" lang="scss"></style>
