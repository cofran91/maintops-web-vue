<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { mdiCalendarMonthOutline, mdiMapMarkerOutline } from '@mdi/js'
import type { UpcomingTask } from '@/types/dashboard'

defineProps<{
  tasks: UpcomingTask[]
}>()

const { t } = useI18n()
</script>

<template>
  <article class="dashboard-card schedule-card">
    <div class="card-heading">
      <div>
        <h2>{{ t('dashboard.upcomingServices') }}</h2>
        <p>{{ t('dashboard.todaySchedule') }}</p>
      </div>
        <button class="calendar-button" :aria-label="t('dashboard.openCalendar')" type="button">
        <v-icon :icon="mdiCalendarMonthOutline" size="20" />
      </button>
    </div>

    <div class="schedule-list">
      <div v-for="task in tasks" :key="task.time" class="schedule-item">
        <div class="schedule-time">
          <strong>{{ task.time }}</strong>
          <i :class="[`schedule-dot--${task.tone}`]" />
        </div>
        <div :class="['schedule-info', `schedule-info--${task.tone}`]">
          <strong>{{ task.title }}</strong>
          <span>{{ task.vehicle }}</span>
          <small><v-icon :icon="mdiMapMarkerOutline" size="13" />{{ task.location }}</small>
        </div>
      </div>
      <p v-if="tasks.length === 0" class="schedule-empty">{{ t('dashboard.noUpcomingServices') }}</p>
    </div>
  </article>
</template>
