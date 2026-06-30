<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiArrowLeft,
  mdiChevronDown,
  mdiClose,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
  mdiWrenchOutline,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canUpdateForAnyRole,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { WORKSHOP_DAYS } from '@/types/workshop.js'
import { ROLES } from '@/types/auth.js'
import usersApi from '@/modules/users/services/usersService.js'
import workshopsApi from '@/modules/workshops/services/workshopsService.js'
import vehicleSystemsApi from '@/modules/vehicle-systems/services/vehicleSystemsService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import UserCombobox from '@/modules/users/components/UserCombobox.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const DEFAULT_OPEN_TIME = '08:00'
const DEFAULT_CLOSE_TIME = '17:00'
const USER_PAGE_SIZE = 10

const form = reactive({
  manager_user_id: '',
  name: '',
  code: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  vehicle_system_ids: [],
  is_active: true,
})
const scheduleRows = reactive(
  WORKSHOP_DAYS.map((day, index) => ({
    key: day,
    enabled: index < 5,
    opens_at: DEFAULT_OPEN_TIME,
    closes_at: DEFAULT_CLOSE_TIME,
  })),
)

const vehicleSystems = ref([])
const technicianOptions = ref([])
const selectedTechnicians = ref([])
const technicianSearch = ref('')
const technicianLoading = ref(false)
const technicianError = ref('')
const technicianPage = ref(1)
const technicianLastPage = ref(1)
const technicianSelectOpen = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref({})

let technicianSearchTimeout
let technicianRequestId = 0

const isEditing = computed(() => route.name === 'operations-workshops-edit')
const workshopId = computed(() => String(route.params.id ?? ''))
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS)
    : canCreateForAnyRole(authStore.roles, RESOURCES.WORKSHOPS),
)
const pageTitle = computed(() =>
  isEditing.value ? t('workshops.form.editTitle') : t('workshops.form.createTitle'),
)
const submitLabel = computed(() =>
  isEditing.value ? t('workshops.actions.saveChanges') : t('workshops.actions.createWorkshop'),
)
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && workshopId.value
    ? { name: 'operations-workshops-detail', params: { id: workshopId.value } }
    : { name: 'operations-workshops' },
)
const hasMoreTechnicians = computed(
  () => technicianPage.value < technicianLastPage.value,
)

const fetchVehicleSystems = async () => {
  const data = await vehicleSystemsApi.index({
    page: 1,
    per_page: 100,
  })

  vehicleSystems.value = data.items
}

const fetchTechnicians = async ({ reset = false } = {}) => {
  if (technicianLoading.value && !reset) {
    return
  }

  if (!reset && !hasMoreTechnicians.value) {
    return
  }

  const currentRequestId = ++technicianRequestId
  const nextPage = reset ? 1 : technicianPage.value + 1

  technicianLoading.value = true
  technicianError.value = ''

  try {
    const data = await usersApi.index({
      search: technicianSearch.value || undefined,
      filters: {
        role: ROLES.TECHNICIAN,
        is_active: true,
        without_workshop: true,
      },
      page: nextPage,
      per_page: USER_PAGE_SIZE,
    })

    if (currentRequestId !== technicianRequestId) {
      return
    }

    technicianOptions.value = reset
      ? mergeUsers([...selectedTechnicians.value, ...data.items])
      : mergeUsers([...technicianOptions.value, ...data.items])
    technicianPage.value = data.pagination.current_page
    technicianLastPage.value = data.pagination.last_page
  } catch (error) {
    if (currentRequestId === technicianRequestId) {
      technicianError.value = normalizeApiError(error).message
    }
  } finally {
    if (currentRequestId === technicianRequestId) {
      technicianLoading.value = false
    }
  }
}

const initializeForm = async () => {
  loading.value = true
  loadError.value = ''
  resetErrors()
  resetForm()
  resetTechnicianState()

  try {
    await fetchVehicleSystems()
    void fetchTechnicians({ reset: true })

    if (isEditing.value) {
      fillForm(await workshopsApi.show(workshopId.value))
    }
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const workshop = isEditing.value
      ? await workshopsApi.update(workshopId.value, buildPayload())
      : await workshopsApi.create(buildPayload())

    await router.push({
      name: 'operations-workshops-detail',
      params: { id: workshop.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const fillForm = (workshop) => {
  form.manager_user_id = workshop.manager_user_id ? String(workshop.manager_user_id) : ''
  form.name = workshop.name ?? ''
  form.code = workshop.code ?? ''
  form.address = workshop.address ?? ''
  form.city = workshop.city ?? ''
  form.phone = workshop.phone ?? ''
  form.email = workshop.email ?? ''
  form.vehicle_system_ids =
    workshop.vehicle_system_ids ??
    workshop.vehicle_systems?.map((system) => system.id) ??
    []
  form.is_active = Boolean(workshop.is_active)
  selectedTechnicians.value = workshop.technicians ?? []
  technicianOptions.value = mergeUsers([
    ...selectedTechnicians.value,
    ...technicianOptions.value,
  ])
  fillSchedule(workshop.weekly_schedule ?? {})
}

const resetForm = () => {
  form.manager_user_id = ''
  form.name = ''
  form.code = ''
  form.address = ''
  form.city = ''
  form.phone = ''
  form.email = ''
  form.vehicle_system_ids = []
  form.is_active = true
  selectedTechnicians.value = []
  resetScheduleToDefault()
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const resetTechnicianState = () => {
  technicianOptions.value = []
  selectedTechnicians.value = []
  technicianSearch.value = ''
  technicianError.value = ''
  technicianPage.value = 1
  technicianLastPage.value = 1
  technicianSelectOpen.value = false
}

const validateForm = () => {
  const errors = {}

  if (!hasPositiveInteger(form.manager_user_id)) {
    errors.manager_user_id = [t('workshops.validation.selectManager')]
  }

  if (form.name.trim() === '') {
    errors.name = [t('workshops.validation.nameRequired')]
  }

  if (form.code.trim() === '') {
    errors.code = [t('workshops.validation.codeRequired')]
  }

  if (form.vehicle_system_ids.length === 0) {
    errors.vehicle_system_ids = [t('workshops.validation.selectVehicleSystem')]
  }

  let hasOpenDay = false

  scheduleRows.forEach((day) => {
    if (!day.enabled) {
      return
    }

    hasOpenDay = true

    if (!day.opens_at || !day.closes_at) {
      errors[`weekly_schedule.${day.key}`] = [t('workshops.validation.setOpeningClosing')]
      return
    }

    if (day.opens_at >= day.closes_at) {
      errors[`weekly_schedule.${day.key}.closes_at`] = [
        t('workshops.validation.closingAfterOpening'),
      ]
    }
  })

  if (!hasOpenDay) {
    errors.weekly_schedule = [t('workshops.validation.selectServiceDay')]
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = t('workshops.validation.reviewHighlighted')
    return false
  }

  return true
}

const buildPayload = () => ({
  manager_user_id: Number(form.manager_user_id),
  name: form.name,
  code: form.code,
  address: nullableText(form.address),
  city: nullableText(form.city),
  phone: nullableText(form.phone),
  email: nullableText(form.email),
  weekly_schedule: buildSchedule(),
  vehicle_system_ids: form.vehicle_system_ids.map(Number),
  technician_user_ids: selectedTechnicians.value.map((technician) => technician.id),
  is_active: form.is_active,
})

const buildSchedule = () => {
  const schedule = {}

  scheduleRows.forEach((day) => {
    if (!day.enabled) {
      return
    }

    schedule[day.key] = {
      opens_at: day.opens_at,
      closes_at: day.closes_at,
    }
  })

  return schedule
}

const fillSchedule = (schedule) => {
  scheduleRows.forEach((day) => {
    const hours = schedule[day.key]

    day.enabled = hours !== undefined
    day.opens_at = hours?.opens_at ?? DEFAULT_OPEN_TIME
    day.closes_at = hours?.closes_at ?? DEFAULT_CLOSE_TIME
  })
}

const resetScheduleToDefault = () => {
  scheduleRows.forEach((day, index) => {
    day.enabled = index < 5
    day.opens_at = DEFAULT_OPEN_TIME
    day.closes_at = DEFAULT_CLOSE_TIME
  })
}

const handleTechnicianScroll = (event) => {
  const target = event.target
  const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24

  if (reachedBottom) {
    void fetchTechnicians({ reset: false })
  }
}

const toggleTechnicianOptions = () => {
  technicianSelectOpen.value = !technicianSelectOpen.value

  if (technicianSelectOpen.value && technicianOptions.value.length === 0) {
    void fetchTechnicians({ reset: true })
  }
}

const openTechnicianOptions = () => {
  technicianSelectOpen.value = true

  if (technicianOptions.value.length === 0) {
    void fetchTechnicians({ reset: true })
  }
}

const handleTechnicianSearchInput = () => {
  technicianSelectOpen.value = true

  if (technicianSearchTimeout) {
    window.clearTimeout(technicianSearchTimeout)
  }

  technicianSearchTimeout = window.setTimeout(() => {
    void fetchTechnicians({ reset: true })
  }, 300)
}

const selectTechnician = (technician) => {
  if (!isTechnicianSelected(technician.id)) {
    selectedTechnicians.value = mergeUsers([...selectedTechnicians.value, technician])
  }

  technicianSearch.value = ''
  technicianSelectOpen.value = false
}

const removeTechnician = (id) => {
  selectedTechnicians.value = selectedTechnicians.value.filter(
    (technician) => technician.id !== id,
  )
}

const isTechnicianSelected = (id) =>
  selectedTechnicians.value.some((technician) => technician.id === id)

const mergeUsers = (users) => {
  const userMap = new Map()

  users.forEach((user) => {
    if (user?.id !== undefined && user?.id !== null) {
      userMap.set(Number(user.id), user)
    }
  })

  return Array.from(userMap.values())
}

const hasPositiveInteger = (value) => {
  const number = Number(value)

  return Number.isInteger(number) && number > 0
}

const nullableText = (value) => {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

const fieldError = (field) => {
  if (validationErrors.value[field]?.[0]) {
    return validationErrors.value[field][0]
  }

  const nestedField = `${field}.`
  const nestedError = Object.entries(validationErrors.value)
    .find(([key]) => key.startsWith(nestedField))?.[1]?.[0]

  return nestedError ?? ''
}

const scheduleError = (day) => fieldError(`weekly_schedule.${day}`)

const dayLabel = (day) => t(`workshops.days.${day}`)

watch(
  () => route.fullPath,
  () => {
    if (canSubmit.value) {
      void initializeForm()
      return
    }

    resetForm()
    resetErrors()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (technicianSearchTimeout) {
    window.clearTimeout(technicianSearchTimeout)
  }
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      :subtitle="t('workshops.form.subtitle')"
      :eyebrow="t('workshops.page.eyebrow')"
      :icon="mdiWrenchOutline"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('workshops.actions.back')"
          :aria-label="t('workshops.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('workshops.form.forbidden') }}
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('workshops.actions.retry')"
            :aria-label="t('workshops.actions.retry')"
            small
            @click="initializeForm"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('workshops.detail.loading') }}
        </p>
      </CardBox>

      <CardBox
        v-else-if="canSubmit && !loadError"
        is-form
        @submit.prevent="submitForm"
      >
        <NotificationBar v-if="formError" color="danger">
          {{ formError }}
        </NotificationBar>

        <div class="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          <FormField
            :label="t('workshops.fields.workshopManager')"
            label-for="manager_user_id"
            :error="fieldError('manager_user_id')"
          >
            <UserCombobox
              v-model="form.manager_user_id"
              input-id="manager_user_id"
              name="manager_user_id"
              :placeholder="t('workshops.filters.managerPlaceholder')"
              :role="ROLES.WORKSHOP_MANAGER"
            />
          </FormField>

          <FormField :label="t('workshops.fields.name')" label-for="name" :error="fieldError('name')">
            <FormControl id="name" v-model="form.name" name="name" required maxlength="255" />
          </FormField>

          <FormField :label="t('workshops.fields.code')" label-for="code" :error="fieldError('code')">
            <FormControl
              id="code"
              v-model="form.code"
              name="code"
              required
              maxlength="100"
              :placeholder="t('workshops.filters.codePlaceholder')"
            />
          </FormField>

          <FormField :label="t('workshops.fields.city')" label-for="city" :error="fieldError('city')">
            <FormControl id="city" v-model="form.city" name="city" maxlength="255" />
          </FormField>

          <FormField :label="t('workshops.fields.phone')" label-for="phone" :error="fieldError('phone')">
            <FormControl id="phone" v-model="form.phone" name="phone" type="tel" maxlength="50" />
          </FormField>

          <FormField :label="t('workshops.fields.email')" label-for="email" :error="fieldError('email')">
            <FormControl
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              maxlength="255"
            />
          </FormField>
        </div>

        <FormField
          :label="t('workshops.fields.address')"
          label-for="address"
          :error="fieldError('address')"
        >
          <FormControl
            id="address"
            v-model="form.address"
            name="address"
            type="textarea"
            maxlength="500"
          />
        </FormField>

        <FormField :label="t('workshops.fields.vehicleSystems')" :error="fieldError('vehicle_system_ids')">
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            <label
              v-for="system in vehicleSystems"
              :key="system.id"
              class="flex min-h-11 items-center gap-2 rounded-sm border border-gray-700 px-3 py-2"
            >
              <input v-model="form.vehicle_system_ids" type="checkbox" :value="system.id">
              <span class="text-sm font-semibold text-gray-900 dark:text-slate-100">
                {{ system.name }}
              </span>
            </label>
          </div>
          <p v-if="vehicleSystems.length === 0" class="mt-2 text-sm text-gray-500">
            {{ t('workshops.form.noVehicleSystems') }}
          </p>
        </FormField>

        <FormField
          :label="t('workshops.fields.assignedTechnicians')"
          :error="fieldError('technician_user_ids')"
        >
          <div class="space-y-3">
            <div
              class="flex min-h-12 flex-wrap items-center gap-2 rounded-sm border border-gray-700
                px-3 py-2"
            >
              <span
                v-if="selectedTechnicians.length === 0"
                class="text-sm text-gray-500 dark:text-slate-400"
              >
                {{ t('workshops.form.noTechniciansSelected') }}
              </span>
              <span
                v-for="technician in selectedTechnicians"
                :key="technician.id"
                class="inline-flex items-center gap-2 rounded-sm bg-blue-50 px-2 py-1
                  text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
              >
                {{ technician.name }}
                <BaseButton
                  color="whiteDark"
                  :icon="mdiClose"
                  small
                  :title="t('workshops.actions.removeTechnician', { name: technician.name })"
                  :aria-label="t('workshops.actions.removeTechnician', { name: technician.name })"
                  @click="removeTechnician(technician.id)"
                />
              </span>
            </div>

            <div class="relative">
              <input
                v-model.trim="technicianSearch"
                type="text"
                autocomplete="off"
                role="combobox"
                aria-haspopup="listbox"
                :aria-expanded="technicianSelectOpen"
                :placeholder="t('workshops.form.searchAvailableTechnicians')"
                class="h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 pr-12
                  dark:bg-slate-800"
                @focus="openTechnicianOptions"
                @input="handleTechnicianSearchInput"
              >
              <button
                type="button"
                class="absolute right-1 top-1 flex h-10 w-10 items-center justify-center
                  rounded-sm text-gray-500 hover:bg-gray-100 dark:text-slate-300
                  dark:hover:bg-slate-700"
                :title="t('workshops.actions.showTechnicians')"
                :aria-label="t('workshops.actions.showTechnicians')"
                @click="toggleTechnicianOptions"
              >
                <BaseIcon :path="mdiChevronDown" size="18" />
              </button>

              <div
                v-if="technicianSelectOpen"
                class="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-md border
                  border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
                role="listbox"
                @scroll="handleTechnicianScroll"
              >
                <button
                  v-for="technician in technicianOptions"
                  :key="technician.id"
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100
                    dark:hover:bg-slate-800"
                  :class="{
                    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
                      isTechnicianSelected(technician.id),
                  }"
                  role="option"
                  :aria-selected="isTechnicianSelected(technician.id)"
                  @click="selectTechnician(technician)"
                >
                  <span class="block font-semibold text-gray-900 dark:text-slate-100">
                    {{ technician.name }}
                  </span>
                  <span class="block text-xs text-gray-500 dark:text-slate-400">
                    {{ technician.email || t('workshops.form.noContactData') }}
                  </span>
                </button>

                <p
                  v-if="technicianLoading && technicianOptions.length === 0"
                  class="px-3 py-3 text-sm text-gray-500"
                >
                  {{ t('workshops.form.loadingTechnicians') }}
                </p>
                <p
                  v-else-if="!technicianLoading && technicianOptions.length === 0"
                  class="px-3 py-3 text-sm text-gray-500"
                >
                  {{ t('workshops.form.noTechniciansFound') }}
                </p>
                <p v-if="technicianError" class="px-3 py-3 text-sm text-red-600">
                  {{ technicianError }}
                </p>
                <p
                  v-if="technicianLoading && technicianOptions.length > 0"
                  class="px-3 py-3 text-sm text-gray-500"
                >
                  {{ t('workshops.form.loadingMore') }}
                </p>
              </div>
            </div>
          </div>
        </FormField>

        <FormField
          :label="t('workshops.fields.weeklySchedule')"
          :error="fieldError('weekly_schedule')"
        >
          <div class="overflow-hidden rounded-sm border border-gray-700">
            <div
              v-for="day in scheduleRows"
              :key="day.key"
              class="grid grid-cols-1 gap-3 border-b border-gray-200 p-3 last:border-b-0
                md:grid-cols-[minmax(0,1fr)_150px_150px] md:items-end
                dark:border-slate-700"
            >
              <label
                class="flex items-center gap-2 font-semibold text-gray-900
                  dark:text-slate-100"
              >
                <input v-model="day.enabled" type="checkbox">
                {{ dayLabel(day.key) }}
              </label>
              <label class="grid gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
                {{ t('workshops.fields.opens') }}
                <input
                  v-model="day.opens_at"
                  type="time"
                  :disabled="!day.enabled"
                  class="h-10 rounded-sm border border-gray-700 bg-white px-2 dark:bg-slate-800"
                >
              </label>
              <label class="grid gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
                {{ t('workshops.fields.closes') }}
                <input
                  v-model="day.closes_at"
                  type="time"
                  :disabled="!day.enabled"
                  class="h-10 rounded-sm border border-gray-700 bg-white px-2 dark:bg-slate-800"
                >
              </label>
              <p v-if="scheduleError(day.key)" class="text-sm text-red-600 md:col-span-3">
                {{ scheduleError(day.key) }}
              </p>
            </div>
          </div>
        </FormField>

        <div class="mb-6 flex items-center gap-3">
          <FormCheckRadio
            v-model="form.is_active"
            name="is_active"
            type="switch"
            :label="t('workshops.form.activeWorkshop')"
            :input-value="true"
          />
          <AppBadge
            :label="form.is_active ? t('workshops.status.active') : t('workshops.status.inactive')"
            :color="form.is_active ? 'success' : 'danger'"
          />
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('workshops.actions.cancel')"
              :aria-label="t('workshops.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? t('workshops.actions.saving') : submitLabel"
              :aria-label="saving ? t('workshops.actions.saving') : submitLabel"
              type="submit"
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>
