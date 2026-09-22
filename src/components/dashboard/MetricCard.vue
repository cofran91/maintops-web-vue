<script setup lang="ts">
import type { DashboardStat } from '@/types/dashboard'

defineProps<{
  stat: DashboardStat
}>()

</script>

<template>
  <article class="metric-card">
    <div class="metric-card__top">
      <span :class="['metric-icon', `metric-icon--${stat.tone}`]">
        <v-icon :icon="stat.icon" size="21" />
      </span>
    </div>

    <div class="metric-card__value">
      <strong>{{ stat.value }}</strong>
    </div>
    <h2>{{ stat.label }}</h2>
  </article>
</template>
