<script setup>
import { computed } from 'vue'
import {
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiChartTimelineVariant,
  mdiMonitor,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
} from '@mdi/js'
import { ROUTE_KEYS, canAccessAnyRoute } from '@/auth/permissions.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const moduleCards = [
  {
    icon: mdiTable,
    title: 'Operations',
    description: 'Users, owners, workshops, and vehicles.',
    links: [
      { to: '/operations/users', permissionKey: ROUTE_KEYS.USERS },
      { to: '/operations/owners', permissionKey: ROUTE_KEYS.OWNERS },
      { to: '/operations/workshops', permissionKey: ROUTE_KEYS.WORKSHOPS },
      { to: '/operations/vehicles', permissionKey: ROUTE_KEYS.VEHICLES },
    ],
    status: 'Configured',
  },
  {
    icon: mdiChartTimelineVariant,
    title: 'Maintenance',
    description: 'Tasks and plans for repeatable service work.',
    links: [
      { to: '/maintenance/tasks', permissionKey: ROUTE_KEYS.MAINTENANCE_TASKS },
      { to: '/maintenance/plans', permissionKey: ROUTE_KEYS.MAINTENANCE_PLANS },
    ],
    status: 'Configured',
  },
  {
    icon: mdiViewList,
    title: 'Orders',
    description: 'Service intake and workshop coordination.',
    links: [{ to: '/orders', permissionKey: ROUTE_KEYS.ORDERS }],
    status: 'Active',
  },
  {
    icon: mdiAccountMultiple,
    title: 'Access',
    description: 'Audit review and role-aware operations.',
    links: [{ to: '/access/audit', permissionKey: ROUTE_KEYS.AUDIT_LOG }],
    status: 'Scoped',
  },
]

const visibleModuleCards = computed(() =>
  moduleCards
    .map((card) => {
      const link = card.links.find((item) => canAccessAnyRoute(authStore.roles, item.permissionKey))

      return link ? { ...card, to: link.to } : null
    })
    .filter(Boolean),
)

const canCreateOrders = computed(() => canAccessAnyRoute(authStore.roles, ROUTE_KEYS.ORDER_CREATE))
const canOpenOrders = computed(() => canAccessAnyRoute(authStore.roles, ROUTE_KEYS.ORDERS))

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: '' },
]

const orderRows = [
  {
    id: 'MO-1048',
    vehicle: 'Fleet truck AX-204',
    workshop: 'North Maintenance Hub',
    status: 'Scheduled',
  },
  {
    id: 'MO-1049',
    vehicle: 'Owner sedan CR-118',
    workshop: 'Central Service Desk',
    status: 'Pending',
  },
  {
    id: 'MO-1050',
    vehicle: 'Fleet van LS-330',
    workshop: 'South Maintenance Hub',
    status: 'Ready',
  },
]

const statusColor = (status) => {
  const colors = {
    Ready: 'success',
    Pending: 'warning',
    Scheduled: 'info',
  }

  return colors[status] ?? 'neutral'
}
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      title="Operational dashboard"
      subtitle="Service activity, operational queues, and workshop coordination."
      eyebrow="MaintOps"
      :icon="mdiMonitor"
    >
      <template #actions>
        <BaseButton
          v-if="canCreateOrders"
          to="/orders/new"
          color="info"
          :icon="mdiSquareEditOutline"
          label="New order"
        />
        <BaseButton v-if="canOpenOrders" to="/orders" color="whiteDark" label="Open orders" />
      </template>

      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiViewList"
          :number="12"
          label="Active orders"
        />
        <CardBoxWidget
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          :number="38"
          label="Operational users"
        />
        <CardBoxWidget
          color="text-red-500"
          :icon="mdiAlertCircle"
          :number="3"
          label="Open alerts"
        />
      </div>

      <div class="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
        <CardBox v-for="card in visibleModuleCards" :key="card.title">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <BaseIcon :path="card.icon" size="24" class="text-blue-500" />
              <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {{ card.title }}
              </h2>
            </div>
            <AppBadge :label="card.status" color="neutral" />
          </div>
          <p class="min-h-10 text-sm text-gray-500 dark:text-slate-400">
            {{ card.description }}
          </p>
          <div class="mt-5">
            <BaseButton :to="card.to" color="whiteDark" label="Open" small />
          </div>
        </CardBox>
      </div>

      <AppDataTable :columns="orderColumns" :rows="orderRows">
        <template #cell-status="{ value }">
          <AppBadge :label="value" :color="statusColor(value)" />
        </template>
        <template #cell-action>
          <BaseButton to="/orders/detail" color="whiteDark" label="Review" small />
        </template>
      </AppDataTable>
    </AppPage>
  </LayoutAuthenticated>
</template>
