<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mdiAlertCircle, mdiSquareEditOutline, mdiTable } from '@mdi/js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

const route = useRoute()

const title = computed(() => route.meta.title ?? 'Record detail')
const subtitle = computed(() => route.meta.subtitle ?? 'Review the selected operational record.')

const detailRows = [
  { id: 'IT-1001', task: 'Initial inspection', assignee: 'Workshop team', status: 'Ready' },
  { id: 'IT-1002', task: 'Parts approval', assignee: 'Advisor', status: 'Pending' },
  { id: 'IT-1003', task: 'Technician assignment', assignee: 'Operations', status: 'Scheduled' },
]

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'task', label: 'Task' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' },
]

const statusColor = (status) => {
  const colors = {
    Ready: 'success',
    Pending: 'warning',
    Scheduled: 'info',
  }

  return colors[status] ?? 'neutral'
}
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="subtitle"
      eyebrow="Orders"
      :icon="mdiTable"
    >
      <template #actions>
        <BaseButton to="/orders/new" color="info" :icon="mdiSquareEditOutline" label="Edit order" />
        <BaseButton to="/orders" color="whiteDark" label="Back to list" />
      </template>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div class="space-y-6">
          <CardBox>
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Maintenance order MO-1048
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Service workflow for workshop coordination.
                </p>
              </div>
              <AppBadge label="Scheduled" color="info" />
            </div>

            <dl class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt class="text-sm font-semibold text-gray-500 dark:text-slate-400">Vehicle</dt>
                <dd class="mt-1 text-gray-900 dark:text-slate-100">Fleet truck AX-204</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-gray-500 dark:text-slate-400">Workshop</dt>
                <dd class="mt-1 text-gray-900 dark:text-slate-100">North Maintenance Hub</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-gray-500 dark:text-slate-400">Advisor</dt>
                <dd class="mt-1 text-gray-900 dark:text-slate-100">Operations desk</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-gray-500 dark:text-slate-400">Technician</dt>
                <dd class="mt-1 text-gray-900 dark:text-slate-100">Pending assignment</dd>
              </div>
            </dl>
          </CardBox>

          <AppDataTable :columns="columns" :rows="detailRows">
            <template #cell-status="{ value }">
              <AppBadge :label="value" :color="statusColor(value)" />
            </template>
          </AppDataTable>
        </div>

        <div class="space-y-6">
          <CardBox>
            <div class="flex items-start gap-3">
              <AppBadge label="Role scope" color="neutral" />
            </div>
            <p class="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Available actions depend on the assigned role and workshop responsibility.
            </p>
          </CardBox>

          <CardBox>
            <div class="flex items-start gap-3">
              <AppBadge label="No alerts" color="success" :icon="mdiAlertCircle" />
            </div>
            <p class="mt-4 text-sm text-gray-500 dark:text-slate-400">
              This order has no blocking exceptions for the current service stage.
            </p>
          </CardBox>
        </div>
      </div>
    </AppPage>
  </LayoutAuthenticated>
</template>
