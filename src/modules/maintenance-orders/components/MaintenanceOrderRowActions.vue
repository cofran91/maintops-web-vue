<script setup>
import {
  mdiCancel,
  mdiCheckCircleOutline,
  mdiClose,
  mdiEyeOutline,
  mdiTruckDeliveryOutline,
} from '@mdi/js'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'

defineProps({
  order: {
    type: Object,
    required: true,
  },
  actions: {
    type: Array,
    required: true,
  },
  updatingStatus: Boolean,
})

const emit = defineEmits(['update-status'])
const { t } = useI18n()

const actionIcon = (status) => {
  if (status === 'approved') {
    return mdiCheckCircleOutline
  }

  if (status === 'delivered') {
    return mdiTruckDeliveryOutline
  }

  return status === 'cancelled' ? mdiCancel : mdiClose
}

const actionColor = (status) =>
  status === 'approved' || status === 'delivered' ? 'success' : 'danger'
const orderActionLabel = (status) => t(`orders.orderActions.${status}`)
</script>

<template>
  <BaseButtons no-wrap mb="" class-addon="mr-2 last:mr-0">
    <BaseButton
      :to="{ name: 'orders-detail', params: { id: order.id } }"
      color="whiteDark"
      :icon="mdiEyeOutline"
      :title="t('orders.actions.openOrder')"
      :aria-label="t('orders.actions.openOrder')"
      small
    />
    <BaseButton
      v-for="status in actions"
      :key="status"
      :color="actionColor(status)"
      :icon="actionIcon(status)"
      :title="orderActionLabel(status)"
      :aria-label="orderActionLabel(status)"
      :disabled="updatingStatus"
      small
      @click="emit('update-status', order, status)"
    />
  </BaseButtons>
</template>
