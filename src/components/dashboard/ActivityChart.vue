<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { mdiChartBar } from '@mdi/js'
import type { WeekActivity } from '@/types/dashboard'

defineProps<{ data: WeekActivity[] }>()
const { t } = useI18n()
</script>

<template>
  <section class="dashboard-feature-section">
    <div class="dashboard-section-heading dashboard-feature-heading">
      <div><span class="page-date">Rendimiento semanal</span><h2>{{ t('dashboard.maintenanceActivity') }}</h2><p>{{ t('dashboard.plannedCompleted') }}</p></div>
      <span class="dashboard-feature-heading__icon dashboard-feature-heading__icon--teal"><v-icon :icon="mdiChartBar" size="20" /></span>
    </div>
    <article class="dashboard-feature-panel dashboard-chart-panel">
      <div class="chart-legend">
        <span><i class="legend-dot legend-dot--planned" /> {{ t('dashboard.planned') }}</span>
        <span><i class="legend-dot legend-dot--done" /> {{ t('dashboard.completed') }}</span>
      </div>
      <div class="bar-chart">
        <div class="axis-labels"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
        <div class="bar-grid">
          <div v-for="day in data" :key="day.day" class="bar-column">
            <div class="bar-pair">
              <i class="bar bar--planned" :style="{ height: day.planned + '%' }" />
              <i class="bar bar--done" :style="{ height: day.completed + '%' }" />
            </div>
            <span>{{ day.day }}</span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
