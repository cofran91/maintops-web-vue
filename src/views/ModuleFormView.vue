<script setup>
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { mdiSquareEditOutline } from '@mdi/js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

const route = useRoute()

const title = computed(() => route.meta.title ?? 'New record')
const subtitle = computed(() => route.meta.subtitle ?? 'Capture operational context.')

const form = reactive({
  vehicle: 'Fleet truck AX-204',
  workshop: 'North Maintenance Hub',
  advisor: 'Operations desk',
  priority: 'Normal',
  notes: '',
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage :title="title" :subtitle="subtitle" eyebrow="Orders" :icon="mdiSquareEditOutline">
      <template #actions>
        <BaseButton to="/orders" color="whiteDark" label="Cancel" />
        <BaseButton color="info" label="Save draft" disabled />
      </template>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <CardBox is-form @submit.prevent>
          <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            <FormField label="Vehicle">
              <FormControl v-model="form.vehicle" name="vehicle" />
            </FormField>
            <FormField label="Workshop">
              <FormControl v-model="form.workshop" name="workshop" />
            </FormField>
            <FormField label="Advisor">
              <FormControl v-model="form.advisor" name="advisor" />
            </FormField>
            <FormField label="Priority">
              <FormControl
                v-model="form.priority"
                name="priority"
                :options="['Low', 'Normal', 'High']"
              />
            </FormField>
          </div>

          <FormField label="Operational notes">
            <FormControl
              v-model="form.notes"
              name="notes"
              type="textarea"
              placeholder="Capture service context for the workshop team"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton color="info" label="Save draft" disabled />
              <BaseButton to="/orders" color="whiteDark" label="Back to orders" />
            </BaseButtons>
          </template>
        </CardBox>

        <div class="space-y-6">
          <CardBox>
            <AppBadge label="Order intake" color="info" />
            <p class="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Capture the operational context before the service order reaches the workshop.
            </p>
          </CardBox>

          <CardBox>
            <AppBadge label="Advisor review" color="warning" />
            <p class="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Priority, notes, and assignment details stay visible during intake review.
            </p>
          </CardBox>
        </div>
      </div>
    </AppPage>
  </LayoutAuthenticated>
</template>
