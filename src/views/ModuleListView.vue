<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { mdiTable } from '@mdi/js'
import { canCreateForAnyRole } from '@/auth/permissions.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDataTable from '@/components/ui/AppDataTable.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const search = ref('')
const status = ref('All')

const title = computed(() => route.meta.title ?? 'Records')
const subtitle = computed(() => route.meta.subtitle ?? 'Review operational records.')
const section = computed(() => route.meta.section ?? 'MaintOps')
const isEmpty = computed(() => route.meta.isEmpty === true)
const createTo = computed(() => route.meta.createTo)
const detailTo = computed(() => route.meta.detailTo)
const resource = computed(() => route.meta.resource)
const canCreateRecord = computed(() =>
  Boolean(createTo.value && resource.value && canCreateForAnyRole(authStore.roles, resource.value)),
)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'scope', label: 'Scope' },
  { key: 'status', label: 'Status' },
  { key: 'updated', label: 'Updated' },
  { key: 'actions', label: '' },
]

const rows = computed(() => {
  if (isEmpty.value) {
    return []
  }

  return [
    {
      id: 'MO-1001',
      name: `${title.value} primary queue`,
      scope: section.value,
      status: 'Ready',
      updated: 'Today',
    },
    {
      id: 'MO-1002',
      name: `${title.value} review lane`,
      scope: section.value,
      status: 'Pending',
      updated: 'Yesterday',
    },
    {
      id: 'MO-1003',
      name: `${title.value} scheduled work`,
      scope: section.value,
      status: 'Scheduled',
      updated: 'This week',
    },
  ]
})

const statusColor = (value) => {
  const colors = {
    Ready: 'success',
    Pending: 'warning',
    Scheduled: 'info',
  }

  return colors[value] ?? 'neutral'
}
</script>

<template>
  <LayoutAuthenticated>
    <AppPage :title="title" :subtitle="subtitle" :eyebrow="section" :icon="mdiTable">
      <template #actions>
        <AppDropdown
          label="View"
          :items="[
            { label: 'Compact table' },
            { label: 'Detailed table' },
            { label: 'Export-ready columns' },
          ]"
        />
        <BaseButton
          :to="canCreateRecord ? createTo : null"
          color="info"
          label="New record"
          :disabled="!canCreateRecord"
        />
      </template>

      <CardBox class="mb-6">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <FormField label="Search">
            <FormControl v-model="search" name="search" placeholder="Search records" />
          </FormField>
          <FormField label="Status">
            <FormControl v-model="status" name="status" :options="['All', 'Ready', 'Pending']" />
          </FormField>
          <div class="mb-6 flex gap-2 lg:justify-end">
            <BaseButton color="whiteDark" label="Reset" />
            <BaseButton color="info" label="Apply" />
          </div>
        </div>
      </CardBox>

      <AppDataTable
        :columns="columns"
        :rows="rows"
        empty-title="No records in this workspace"
        empty-description="No records match the current workspace filters."
      >
        <template #cell-status="{ value }">
          <AppBadge :label="value" :color="statusColor(value)" />
        </template>
        <template #cell-actions>
          <BaseButton
            :to="detailTo || null"
            color="whiteDark"
            label="Open"
            small
            :disabled="!detailTo"
          />
        </template>
      </AppDataTable>

    </AppPage>
  </LayoutAuthenticated>
</template>
