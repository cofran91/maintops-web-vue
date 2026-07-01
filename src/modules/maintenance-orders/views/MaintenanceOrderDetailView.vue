<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  mdiArrowLeft,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import { useMaintenanceOrderDetail } from '@/modules/maintenance-orders/composables/useMaintenanceOrderDetail.js'
import {
  actionColor,
  actionIcon,
} from '@/modules/maintenance-orders/utils/orderDetailFormatters.js'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import MaintenanceOrderItemsTable from '@/modules/maintenance-orders/components/MaintenanceOrderItemsTable.vue'
import MaintenanceOrderSummary from '@/modules/maintenance-orders/components/MaintenanceOrderSummary.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const itemColumns = computed(() => [
  { key: 'task', label: t('orders.itemColumns.task') },
  { key: 'plan', label: t('orders.itemColumns.plan') },
  { key: 'system', label: t('orders.itemColumns.system') },
  { key: 'status', label: t('orders.itemColumns.status') },
  { key: 'duration', label: t('orders.itemColumns.duration') },
  { key: 'scheduled_at', label: t('orders.itemColumns.scheduled') },
  { key: 'actions', label: '' },
])

const orderId = computed(() => String(route.params.id ?? ''))
const {
  availableItemActions,
  availableOrderActions,
  errorMessage,
  fetchOrder,
  items,
  loading,
  order,
  updateItemStatus,
  updateOrderStatus,
  updatingStatus,
} = useMaintenanceOrderDetail(orderId, authStore)
const title = computed(() =>
  order.value
    ? t('orders.labels.orderNumber', { id: String(order.value.id).padStart(5, '0') })
    : t('orders.detail.titleFallback'),
)
const orderActionLabel = (status) => t(`orders.orderActions.${status}`)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('orders.detail.subtitle')"
      :eyebrow="t('orders.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'orders' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('orders.actions.backToOrders')"
          :aria-label="t('orders.actions.backToOrders')"
        />
        <BaseButton
          v-for="status in availableOrderActions"
          :key="status"
          :color="actionColor(status)"
          :icon="actionIcon(status)"
          :title="orderActionLabel(status)"
          :aria-label="orderActionLabel(status)"
          :disabled="updatingStatus"
          @click="updateOrderStatus(status)"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('orders.actions.retry')"
            :aria-label="t('orders.actions.retry')"
            small
            @click="fetchOrder"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('orders.detail.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="!order && !errorMessage"
        :title="t('orders.detail.unavailableTitle')"
        :description="t('orders.detail.unavailableDescription')"
      />

      <div v-else-if="order" class="grid grid-cols-1 gap-6">
        <MaintenanceOrderSummary :order="order" :items-count="items.length" />
        <MaintenanceOrderItemsTable
          :columns="itemColumns"
          :items="items"
          :updating-status="updatingStatus"
          :available-item-actions="availableItemActions"
          @update-item-status="updateItemStatus"
        />
      </div>
    </AppPage>
  </LayoutAuthenticated>
</template>
