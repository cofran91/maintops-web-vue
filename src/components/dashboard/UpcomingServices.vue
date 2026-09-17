<script setup lang="ts">
import { mdiCalendarMonthOutline, mdiChevronRight, mdiClockOutline, mdiMapMarkerOutline } from '@mdi/js'
import type { UpcomingTask } from '@/types/dashboard'

defineProps<{
  tasks: UpcomingTask[]
}>()
</script>

<template>
  <article class="dashboard-card schedule-card">
    <div class="card-heading">
      <div>
        <h2>Próximos servicios</h2>
        <p>Agenda de hoy</p>
      </div>
      <button class="calendar-button" aria-label="Abrir calendario" type="button">
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
      <p v-if="tasks.length === 0" class="schedule-empty">No hay servicios próximos.</p>
    </div>

    <button class="schedule-footer" type="button">
      <v-icon :icon="mdiClockOutline" size="17" />
      Ver agenda completa
      <v-icon :icon="mdiChevronRight" size="17" />
    </button>
  </article>
</template>
