<script setup lang="ts">
import { mdiArrowUp, mdiDotsHorizontal } from '@mdi/js'
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
      <button aria-label="Más opciones" type="button">
        <v-icon :icon="mdiDotsHorizontal" size="20" />
      </button>
    </div>

    <div class="metric-card__value">
      <strong>{{ stat.value }}</strong>
      <span :class="[`metric-change--${stat.tone}`]">
        <v-icon v-if="stat.change.startsWith('+')" :icon="mdiArrowUp" size="12" />
        {{ stat.change }}
      </span>
    </div>
    <h2>{{ stat.label }}</h2>

    <div class="metric-card__bottom">
      <small>{{ stat.detail }}</small>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none">
        <defs>
          <linearGradient :id="`fill-${stat.tone}`" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".2" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polygon :fill="`url(#fill-${stat.tone})`" :points="`1,32 ${stat.points} 99,32`" />
        <polyline :points="stat.points" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
    </div>
  </article>
</template>
