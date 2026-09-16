<script setup lang="ts">
import { mdiChevronDown } from '@mdi/js'
import type { WeekActivity } from '@/types/dashboard'

defineProps<{
  data: WeekActivity[]
}>()
</script>

<template>
  <article class="dashboard-card activity-chart-card">
    <div class="card-heading">
      <div>
        <h2>Actividad de mantenimiento</h2>
        <p>Órdenes planificadas y completadas esta semana</p>
      </div>
      <button class="period-selector" type="button">
        Esta semana
        <v-icon :icon="mdiChevronDown" size="16" />
      </button>
    </div>

    <div class="chart-legend">
      <span><i class="legend-dot legend-dot--planned" /> Planificadas</span>
      <span><i class="legend-dot legend-dot--done" /> Completadas</span>
    </div>

    <div class="bar-chart">
      <div class="axis-labels">
        <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
      </div>
      <div class="bar-grid">
        <div v-for="day in data" :key="day.day" class="bar-column">
          <div class="bar-pair">
            <i class="bar bar--planned" :style="{ height: `${day.planned}%` }" />
            <i class="bar bar--done" :style="{ height: `${day.completed}%` }" />
          </div>
          <span>{{ day.day }}</span>
        </div>
      </div>
    </div>
  </article>
</template>
