<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { StatusBreakdown } from '@/types/dashboard'

defineProps<{
  statuses: StatusBreakdown[]
}>()

const { t } = useI18n()
</script>

<template>
  <article class="dashboard-card status-card">
    <div class="card-heading">
      <div>
        <h2>{{ t('dashboard.orderStatus') }}</h2>
        <p>{{ t('dashboard.currentDistribution') }}</p>
      </div>
    </div>

    <div class="status-list">
      <div v-for="status in statuses" :key="status.label" class="status-item">
        <span class="status-name"><i :style="{ background: status.color }" />{{ status.label }}</span>
        <span><strong>{{ status.count }}</strong><small>{{ status.value }}%</small></span>
      </div>
    </div>
  </article>
</template>
