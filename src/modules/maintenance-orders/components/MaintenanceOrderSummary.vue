<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCalendar, mdiCar, mdiWrenchOutline } from '@mdi/js'
import { orderStatusColor } from '@/modules/maintenance-orders/statusRules.js'
import {
  formatOrderDetailDate,
  itemCountLabel,
  userLabel,
  vehicleLabel,
  workshopLabel,
} from '@/modules/maintenance-orders/utils/orderDetailFormatters.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  itemsCount: {
    type: Number,
    required: true,
  },
})

const { locale, t } = useI18n()
const orderStatusLabel = (status) => t(`orders.status.${status}`)
const formatDate = (value) => formatOrderDetailDate(value, locale.value)
const orderItems = computed(() => [
  { icon: mdiCar, label: t('orders.fields.vehicle'), value: vehicleLabel(props.order.vehicle) },
  { icon: mdiCar, label: t('orders.fields.owner'), value: userLabel(props.order.owner) },
  { icon: mdiWrenchOutline, label: t('orders.fields.advisor'), value: userLabel(props.order.advisor) },
  { icon: mdiWrenchOutline, label: t('orders.fields.workshop'), value: workshopLabel(props.order.workshop, t) },
  { icon: mdiWrenchOutline, label: t('orders.fields.technician'), value: userLabel(props.order.technician) },
  { icon: mdiCalendar, label: t('orders.fields.created'), value: formatDate(props.order.created_at) },
  { icon: mdiCalendar, label: t('orders.fields.scheduled'), value: formatDate(props.order.scheduled_at) },
  { icon: mdiCalendar, label: t('orders.fields.started'), value: formatDate(props.order.started_at) },
  { icon: mdiCalendar, label: t('orders.fields.finished'), value: formatDate(props.order.finished_at) },
  { icon: mdiCalendar, label: t('orders.fields.delivered'), value: formatDate(props.order.delivered_at) },
  { icon: mdiCalendar, label: t('orders.fields.cancelled'), value: formatDate(props.order.cancelled_at) },
])
</script>

<template>
  <CardBox>
    <div class="mb-5 flex flex-wrap gap-2">
      <AppBadge
        :label="orderStatusLabel(order.status)"
        :color="orderStatusColor(order.status)"
      />
      <AppBadge :label="itemCountLabel(itemsCount, t)" color="info" />
    </div>

    <dl class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in orderItems" :key="item.label">
        <dt
          class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500
            dark:text-slate-400"
        >
          <BaseIcon :path="item.icon" size="16" />
          {{ item.label }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ item.value }}
        </dd>
      </div>
    </dl>
  </CardBox>
</template>
