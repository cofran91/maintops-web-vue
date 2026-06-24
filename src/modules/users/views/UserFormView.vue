<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountEdit,
  mdiArrowLeft,
  mdiClose,
  mdiContentSaveOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js'
import {
  RESOURCES,
  canCreateForAnyRole,
  canUpdateForAnyRole,
  getAssignableRoles,
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { ROLE_LABELS, ROLES } from '@/types/auth.js'
import usersApi from '@/modules/users/services/usersService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import FormControl from '@/components/FormControl.vue'
import FormField from '@/components/FormField.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'
import WorkshopCombobox from '@/modules/users/components/WorkshopCombobox.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const inputClass =
  'h-12 w-full rounded-sm border border-gray-700 bg-white px-3 py-2 dark:bg-slate-800'

const form = reactive({
  name: '',
  email: '',
  role: ROLES.TECHNICIAN,
  password: '',
  password_confirmation: '',
  is_active: true,
  phone: '',
  document_number: '',
  address: '',
  workshop_id: '',
})

const loadedUser = ref(null)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref({})

const isEditing = computed(() => route.name === 'operations-users-edit')
const userId = computed(() => String(route.params.id ?? ''))
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.USERS)
    : canCreateForAnyRole(authStore.roles, RESOURCES.USERS),
)
const baseAssignableRoles = computed(() => getAssignableRoles(authStore.roles))
const currentLoadedRole = computed(() => loadedUser.value?.roles?.[0] ?? null)
const roleOptions = computed(() => {
  const options = [...baseAssignableRoles.value]

  if (currentLoadedRole.value && !options.includes(currentLoadedRole.value)) {
    options.unshift(currentLoadedRole.value)
  }

  return options
})
const isSystemAdmin = computed(() =>
  authStore.roles.some((role) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)),
)
const showWorkshopField = computed(
  () => isSystemAdmin.value && form.role === ROLES.TECHNICIAN,
)
const pageTitle = computed(() => (isEditing.value ? 'Edit user' : 'Create user'))
const submitLabel = computed(() => (isEditing.value ? 'Save changes' : 'Create user'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && userId.value
    ? { name: 'operations-users-detail', params: { id: userId.value } }
    : { name: 'operations-users' },
)

const fetchUser = async () => {
  loading.value = true
  loadError.value = ''

  try {
    loadedUser.value = await usersApi.show(userId.value)
    fillForm(loadedUser.value)
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  resetErrors()
  saving.value = true

  try {
    const user = isEditing.value
      ? await usersApi.update(userId.value, buildPayload())
      : await usersApi.create(buildPayload())

    await router.push({
      name: 'operations-users-detail',
      params: { id: user.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const fillForm = (user) => {
  const primaryRole = user.roles?.[0] ?? roleOptions.value[0] ?? ROLES.TECHNICIAN

  form.name = user.name ?? ''
  form.email = user.email ?? ''
  form.role = roleOptions.value.includes(primaryRole) ? primaryRole : roleOptions.value[0]
  form.password = ''
  form.password_confirmation = ''
  form.is_active = Boolean(user.is_active)
  form.phone = user.phone ?? ''
  form.document_number = user.document_number ?? ''
  form.address = user.address ?? ''
  form.workshop_id = user.workshop_id ? String(user.workshop_id) : ''
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.role = roleOptions.value[0] ?? ROLES.TECHNICIAN
  form.password = ''
  form.password_confirmation = ''
  form.is_active = true
  form.phone = ''
  form.document_number = ''
  form.address = ''
  form.workshop_id = ''
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const buildPayload = () => {
  const payload = {
    name: form.name,
    email: form.email,
    role: form.role,
    is_active: form.is_active,
    phone: nullableText(form.phone),
    document_number: nullableText(form.document_number),
    address: nullableText(form.address),
    workshop_id: showWorkshopField.value ? nullableId(form.workshop_id) : null,
    password: form.password,
    password_confirmation: form.password_confirmation,
  }

  return payload
}

const nullableText = (value) => {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

const nullableId = (value) => {
  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : null
}

const fieldError = (field) => validationErrors.value[field]?.[0] ?? ''
const roleLabel = (role) => ROLE_LABELS[role] ?? role

watch(
  () => route.fullPath,
  () => {
    resetErrors()
    loadedUser.value = null

    if (!canSubmit.value) {
      resetForm()
      return
    }

    if (isEditing.value) {
      void fetchUser()
      return
    }

    resetForm()
  },
  { immediate: true },
)

watch(
  roleOptions,
  (options) => {
    if (!options.includes(form.role)) {
      form.role = options[0] ?? ROLES.TECHNICIAN
    }
  },
  { immediate: true },
)

watch(
  () => form.role,
  (role) => {
    if (role !== ROLES.TECHNICIAN) {
      form.workshop_id = ''
    }
  },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      subtitle="Manage profile data, active status, role assignment, and technician workshop scope."
      eyebrow="Operations"
      :icon="mdiAccountEdit"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back"
          aria-label="Back"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        Your role cannot perform this user action.
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            title="Retry"
            aria-label="Retry"
            small
            @click="fetchUser"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading user...</p>
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
          <FormField label="Name" label-for="name" :error="fieldError('name')">
            <FormControl
              id="name"
              v-model="form.name"
              name="name"
              required
              autocomplete="name"
              maxlength="255"
            />
          </FormField>

          <FormField label="Email" label-for="email" :error="fieldError('email')">
            <FormControl
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              autocomplete="email"
              maxlength="255"
            />
          </FormField>

          <FormField label="Role" label-for="role" :error="fieldError('role')">
            <select id="role" v-model="form.role" name="role" required :class="inputClass">
              <option v-for="role in roleOptions" :key="role" :value="role">
                {{ roleLabel(role) }}
              </option>
            </select>
          </FormField>

          <FormField
            v-if="showWorkshopField"
            label="Workshop"
            label-for="workshop_id"
            :error="fieldError('workshop_id')"
            help="Only technician users can be assigned to a workshop from this form."
          >
            <WorkshopCombobox
              v-model="form.workshop_id"
              input-id="workshop_id"
              name="workshop_id"
              placeholder="Search by code, name, or city"
            />
          </FormField>

          <FormField label="Password" label-for="password" :error="fieldError('password')">
            <FormControl
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <FormField
            label="Confirm password"
            label-for="password_confirmation"
            :error="fieldError('password_confirmation')"
          >
            <FormControl
              id="password_confirmation"
              v-model="form.password_confirmation"
              name="password_confirmation"
              type="password"
              required
              autocomplete="new-password"
            />
          </FormField>

          <FormField label="Phone" label-for="phone" :error="fieldError('phone')">
            <FormControl
              id="phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              maxlength="50"
            />
          </FormField>

          <FormField
            label="Document"
            label-for="document_number"
            :error="fieldError('document_number')"
          >
            <FormControl
              id="document_number"
              v-model="form.document_number"
              name="document_number"
              maxlength="100"
            />
          </FormField>
        </div>

        <FormField label="Address" label-for="address" :error="fieldError('address')">
          <FormControl
            id="address"
            v-model="form.address"
            name="address"
            type="textarea"
            maxlength="500"
          />
        </FormField>

        <div class="mb-6 flex items-center gap-3">
          <FormCheckRadio
            v-model="form.is_active"
            name="is_active"
            type="switch"
            label="Active user"
            :input-value="true"
          />
          <AppBadge
            :label="form.is_active ? 'Active' : 'Inactive'"
            :color="form.is_active ? 'success' : 'danger'"
          />
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              title="Cancel"
              aria-label="Cancel"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? 'Saving...' : submitLabel"
              :aria-label="saving ? 'Saving...' : submitLabel"
              type="submit"
              :disabled="saving || roleOptions.length === 0"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>
