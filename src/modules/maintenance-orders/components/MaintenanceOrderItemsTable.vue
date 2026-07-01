<script setup>
import { useI18n } from 'vue-i18n'
import { orderItemStatusColor } from '@/modules/maintenance-orders/statusRules.js'
import {
  actionColor,
  actionIcon,
  durationLabel,
  formatOrderDetailDate,
  kilometersLabel,
  planLabel,
  systemLabel,
  taskLabel,
} from '@/modules/maintenance-orders/utils/orderDetailFormatters.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'

defineProps({
  columns: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  updatingStatus: Boolean,
  availableItemActions: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update-item-status'])
const { locale, t } = useI18n()

const formatDate = (value) => formatOrderDetailDate(value, locale.value)
const itemStatusLabel = (status) => t(`orders.itemStatus.${status}`)
const itemActionLabel = (status) => t(`orders.itemActions.${status}`)
</script>

<template>
  <CardBox>
    <AppDataTable
      v-if="items.length"
      :columns="columns"
      :rows="items"
      :empty-title="t('orders.items.emptyTitle')"
      :empty-description="t('orders.items.emptyDescription')"
    >
      <template #cell-task="{ row }">
        <div class="min-w-0">
          <p class="font-semibold text-gray-900 dark:text-slate-100">
            {{ taskLabel(row, t) }}
          </p>
          <p class="truncate text-sm text-gray-500 dark:text-slate-400">
            {{ kilometersLabel(row.odometer_km, locale, t) }}
          </p>
        </div>
      </template>
      <template #cell-plan="{ row }">
        {{ planLabel(row) }}
      </template>
      <template #cell-system="{ row }">
        {{ systemLabel(row) }}
      </template>
      <template #cell-status="{ value }">
        <AppBadge
          :label="itemStatusLabel(value)"
          :color="orderItemStatusColor(value)"
        />
      </template>
      <template #cell-duration="{ row }">
        {{
          durationLabel(
            row.planned_duration_minutes ??
            row.maintenance_task?.estimated_duration_minutes,
            locale,
            t,
          )
        }}
      </template>
      <template #cell-scheduled_at="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-actions="{ row }">
        <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
          <BaseButton
            v-for="status in availableItemActions(row)"
            :key="status"
            :color="actionColor(status)"
            :icon="actionIcon(status)"
            :title="itemActionLabel(status)"
            :aria-label="itemActionLabel(status)"
            :disabled="updatingStatus"
            small
            @click="emit('update-item-status', row, status)"
          />
        </BaseButtons>
      </template>
    </AppDataTable>

    <AppEmptyState
      v-else
      :title="t('orders.items.emptyTitle')"
      :description="t('orders.items.emptyDescription')"
    />
  </CardBox>
</template>
