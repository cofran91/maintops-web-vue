<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
import {
  firstFieldError,
  nullableId,
  nullableText,
} from '@/modules/shared/utils/formValues.js'
import { ROLES } from '@/types/auth.js'
import usersApi from '@/modules/users/services/usersService.js'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import UserAccountFields from '@/modules/users/components/UserAccountFields.vue'
import UserPasswordFields from '@/modules/users/components/UserPasswordFields.vue'
import UserRoleFields from '@/modules/users/components/UserRoleFields.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t, te } = useI18n()

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
const pageTitle = computed(() =>
  isEditing.value ? t('users.form.editTitle') : t('users.form.createTitle'),
)
const submitLabel = computed(() =>
  isEditing.value ? t('users.actions.saveChanges') : t('users.actions.createUser'),
)
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

const fieldError = (field) => firstFieldError(validationErrors.value, field)
const setField = (field, value) => {
  form[field] = value
}
const humanizeRole = (role) => String(role ?? '').replace(/_/g, ' ')
const roleLabel = (role) => {
  const key = `users.roles.${role}`

  return te(key) ? t(key) : humanizeRole(role)
}

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
      :subtitle="t('users.form.subtitle')"
      :eyebrow="t('users.page.eyebrow')"
      :icon="mdiAccountEdit"
    >
      <template #actions>
        <BaseButton
          :to="backRoute"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('users.actions.back')"
          :aria-label="t('users.actions.back')"
        />
      </template>

      <NotificationBar v-if="!canSubmit" color="danger">
        {{ t('users.form.forbidden') }}
      </NotificationBar>

      <NotificationBar v-if="loadError" color="danger">
        {{ loadError }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('users.actions.retry')"
            :aria-label="t('users.actions.retry')"
            small
            @click="fetchUser"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('users.detail.loading') }}
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

        <UserAccountFields
          :form="form"
          :field-error="fieldError"
          @update-field="setField"
        />

        <UserRoleFields
          :form="form"
          :field-error="fieldError"
          :input-class="inputClass"
          :role-options="roleOptions"
          :role-label="roleLabel"
          :show-workshop-field="showWorkshopField"
          @update-field="setField"
        />

        <UserPasswordFields
          :form="form"
          :field-error="fieldError"
          @update-field="setField"
        />

        <template #footer>
          <BaseButtons>
            <BaseButton
              :to="backRoute"
              color="whiteDark"
              :icon="mdiClose"
              :title="t('users.actions.cancel')"
              :aria-label="t('users.actions.cancel')"
            />
            <BaseButton
              color="info"
              :icon="submitIcon"
              :title="saving ? t('users.actions.saving') : submitLabel"
              :aria-label="saving ? t('users.actions.saving') : submitLabel"
              type="submit"
              :disabled="saving || roleOptions.length === 0"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>
