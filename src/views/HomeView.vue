<script setup>
import {
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiChartTimelineVariant,
  mdiMonitor,
  mdiTable,
} from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxWidget from '@/components/CardBoxWidget.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'

const moduleCards = [
  {
    icon: mdiTable,
    title: 'Operations',
    items: ['Users', 'Workshops', 'Vehicles', 'Orders'],
  },
  {
    icon: mdiChartTimelineVariant,
    title: 'Maintenance',
    items: ['Tasks', 'Plans', 'Order items'],
  },
  {
    icon: mdiAccountMultiple,
    title: 'Access',
    items: ['Roles', 'UX permissions', 'Audit'],
  },
]
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiMonitor" title="MaintOps" main>
        <span
          class="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-slate-900 dark:text-blue-300"
        >
          Bootstrap
        </span>
      </SectionTitleLineWithButton>

      <NotificationBar color="info" :icon="mdiAlertCircle">
        Initial MaintOps console base.
      </NotificationBar>

      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiTable"
          :number="0"
          label="Active orders"
        />
        <CardBoxWidget
          color="text-emerald-500"
          :icon="mdiAccountMultiple"
          :number="0"
          label="Operational users"
        />
        <CardBoxWidget
          color="text-red-500"
          :icon="mdiAlertCircle"
          :number="0"
          label="Open alerts"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardBox v-for="card in moduleCards" :key="card.title">
          <div class="mb-4 flex items-center gap-3">
            <BaseIcon :path="card.icon" size="24" class="text-blue-500" />
            <h2 class="text-xl font-semibold">{{ card.title }}</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in card.items"
              :key="item"
              class="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-slate-800
                dark:text-slate-200"
            >
              {{ item }}
            </span>
          </div>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
