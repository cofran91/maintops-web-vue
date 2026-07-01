<script setup>
import { useI18n } from 'vue-i18n'
import { orderStatusColor } from '@/modules/maintenance-orders/statusRules.js'
import {
  formatOrderDate,
  itemCountLabel,
  orderNumber,
  userLabel,
  vehicleLabel,
  workshopLabel,
} from '@/modules/maintenance-orders/utils/orderListFormatters.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import MaintenanceOrderRowActions from '@/modules/maintenance-orders/components/MaintenanceOrderRowActions.vue'

defineProps({
  columns: {
    type: Array,
    required: true,
  },
  orders: {
    type: Array,
    required: true,
  },
  updatingStatus: Boolean,
  availableActions: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update-status'])
const { locale, t } = useI18n()

const orderStatusLabel = (status) => t(`orders.status.${status}`)
const formatDate = (value) => formatOrderDate(value, locale.value)
</script>

<template>
  <AppDataTable
    :columns="columns"
    :rows="orders"
    :empty-title="t('orders.list.emptyTitle')"
    :empty-description="t('orders.list.emptyDescription')"
  >
    <template #cell-order="{ row }">
      <div class="min-w-0">
        <p class="font-semibold text-gray-900 dark:text-slate-100">
          {{ orderNumber(row, t) }}
        </p>
        <p class="truncate text-sm text-gray-500 dark:text-slate-400">
          {{ formatDate(row.created_at) }}
        </p>
      </div>
    </template>
    <template #cell-vehicle="{ row }">
      {{ vehicleLabel(row, t) }}
    </template>
    <template #cell-owner="{ row }">
      {{ userLabel(row.owner) }}
    </template>
    <template #cell-advisor="{ row }">
      {{ userLabel(row.advisor) }}
    </template>
    <template #cell-workshop="{ row }">
      {{ workshopLabel(row.workshop, t) }}
    </template>
    <template #cell-technician="{ row }">
      {{ userLabel(row.technician) }}
    </template>
    <template #cell-status="{ value }">
      <AppBadge
        :label="orderStatusLabel(value)"
        :color="orderStatusColor(value)"
      />
    </template>
    <template #cell-items="{ row }">
      {{ itemCountLabel(row.items, t) }}
    </template>
    <template #cell-updated_at="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #cell-actions="{ row }">
      <MaintenanceOrderRowActions
        :order="row"
        :actions="availableActions(row)"
        :updating-status="updatingStatus"
        @update-status="(...args) => emit('update-status', ...args)"
      />
    </template>
  </AppDataTable>
</template>
