<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AsyncEntityCombobox from '@/modules/shared/components/AsyncEntityCombobox.vue'
import maintenancePlansApi from '@/modules/maintenance-plans/services/maintenancePlansService.js'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  activeOnly: {
    type: Boolean,
    default: true,
  },
  disabled: Boolean,
  inputId: String,
  name: String,
  placeholder: {
    type: String,
    default: null,
  },
  perPage: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])
const { locale, t } = useI18n()

const value = computed({
  get: () => props.modelValue,
  set: (nextValue) => emit('update:modelValue', nextValue),
})
const resolvedPlaceholder = computed(() =>
  props.placeholder ?? t('maintenancePlans.combobox.placeholder'),
)
const resetKey = computed(() => [props.activeOnly])

const planLabel = (plan) => {
  if (!plan) {
    return ''
  }

  return [plan.code, plan.name].filter(Boolean).join(' - ')
}

const planMeta = (plan) =>
  [
    plan.recommended_interval_days
      ? t('maintenancePlans.units.days', {
          value: new Intl.NumberFormat(locale.value).format(plan.recommended_interval_days),
        })
      : null,
    plan.recommended_interval_km
      ? t('maintenancePlans.units.kilometers', {
          value: new Intl.NumberFormat(locale.value).format(plan.recommended_interval_km),
        })
      : null,
  ].filter(Boolean).join(' / ') || t('maintenancePlans.combobox.noInterval')

const fetchPlans = ({ search, page, perPage }) =>
  maintenancePlansApi.index({
    search: search || undefined,
    filters: props.activeOnly ? { is_active: true } : {},
    page,
    per_page: perPage,
  })

const selectPlan = (plan) => {
  emit('select', plan)
}
</script>

<template>
  <AsyncEntityCombobox
    v-model="value"
    :disabled="disabled"
    :input-id="inputId"
    :name="name"
    :placeholder="resolvedPlaceholder"
    :per-page="perPage"
    :fetch-options="fetchPlans"
    :fetch-selected="maintenancePlansApi.show"
    :get-option-label="planLabel"
    :clear-label="t('maintenancePlans.combobox.clear')"
    :show-label="t('maintenancePlans.combobox.show')"
    :loading-label="t('maintenancePlans.combobox.loading')"
    :empty-label="t('maintenancePlans.combobox.empty')"
    :loading-more-label="t('maintenancePlans.combobox.loadingMore')"
    :reset-key="resetKey"
    @select="selectPlan"
  >
    <template #option="{ option: plan }">
      <span class="block font-semibold text-gray-900 dark:text-slate-100">
        {{ planLabel(plan) }}
      </span>
      <span class="block text-xs text-gray-500 dark:text-slate-400">
        {{ planMeta(plan) }}
      </span>
    </template>
  </AsyncEntityCombobox>
</template>
