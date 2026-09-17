<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { mdiArrowRight, mdiCarMultiple, mdiDotsHorizontal } from '@mdi/js'
import type { RecentOrder } from '@/types/dashboard'

defineProps<{
  orders: RecentOrder[]
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (event: 'viewAll'): void
  (event: 'viewOrder', orderId: number): void
}>()
</script>

<template>
  <article class="dashboard-card orders-card">
    <div class="card-heading card-heading--table">
      <div>
        <h2>{{ t('dashboard.recentOrders') }}</h2>
        <p>{{ t('dashboard.latestUpdates') }}</p>
      </div>
      <button class="see-all" type="button" @click="emit('viewAll')">
        {{ t('dashboard.viewAll') }} <v-icon :icon="mdiArrowRight" size="17" />
      </button>
    </div>

    <div class="orders-table-wrap">
      <table class="orders-table">
        <thead>
          <tr>
            <th>{{ t('dashboard.order') }}</th>
            <th>{{ t('dashboard.vehicle') }}</th>
            <th>{{ t('dashboard.workshop') }}</th>
            <th>{{ t('dashboard.technician') }}</th>
            <th>{{ t('dashboard.update') }}</th>
            <th>{{ t('dashboard.status') }}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <button class="order-link" type="button" @click="emit('viewOrder', order.orderId)">
                {{ order.id }}
              </button>
            </td>
            <td>
              <div class="vehicle-cell">
                <span><v-icon :icon="mdiCarMultiple" size="18" /></span>
                <div><strong>{{ order.vehicle }}</strong><small>{{ order.plate }}</small></div>
              </div>
            </td>
            <td>{{ order.workshop }}</td>
            <td>
              <div class="technician-cell">
                <span>{{ order.initials }}</span>{{ order.technician }}
              </div>
            </td>
            <td>{{ order.date }}</td>
            <td>
              <span :class="['order-status', `order-status--${order.statusKey}`]">
                <i />{{ order.status }}
              </span>
            </td>
            <td>
              <button :aria-label="t('common.moreOptions')" class="row-action" type="button">
                <v-icon :icon="mdiDotsHorizontal" size="19" />
              </button>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td class="table-empty" colspan="7">{{ t('dashboard.noScheduledOrders') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>
