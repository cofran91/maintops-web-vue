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
} from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import ownersApi from '@/modules/owners/services/ownersService.js'
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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  is_active: true,
  phone: '',
  document_number: '',
  address: '',
})

const loadedOwner = ref(null)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref({})

const isEditing = computed(() => route.name === 'operations-owners-edit')
const ownerId = computed(() => String(route.params.id ?? ''))
const canSubmit = computed(() =>
  isEditing.value
    ? canUpdateForAnyRole(authStore.roles, RESOURCES.OWNERS)
    : canCreateForAnyRole(authStore.roles, RESOURCES.OWNERS),
)
const pageTitle = computed(() => (isEditing.value ? 'Edit owner' : 'Create owner'))
const submitLabel = computed(() => (isEditing.value ? 'Save changes' : 'Create owner'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && ownerId.value
    ? { name: 'operations-owners-detail', params: { id: ownerId.value } }
    : { name: 'operations-owners' },
)

const fetchOwner = async () => {
  loading.value = true
  loadError.value = ''

  try {
    loadedOwner.value = await ownersApi.show(ownerId.value)
    fillForm(loadedOwner.value)
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
    const owner = isEditing.value
      ? await ownersApi.update(ownerId.value, buildPayload())
      : await ownersApi.create(buildPayload())

    await router.push({
      name: 'operations-owners-detail',
      params: { id: owner.id },
    })
  } catch (error) {
    const apiError = normalizeApiError(error)

    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const fillForm = (owner) => {
  form.name = owner.name ?? ''
  form.email = owner.email ?? ''
  form.is_active = Boolean(owner.is_active)
  form.phone = owner.phone ?? ''
  form.document_number = owner.document_number ?? ''
  form.address = owner.address ?? ''
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.is_active = true
  form.phone = ''
  form.document_number = ''
  form.address = ''
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  validationErrors.value = {}
}

const buildPayload = () => ({
  name: form.name,
  email: form.email,
  is_active: form.is_active,
  phone: nullableText(form.phone),
  document_number: nullableText(form.document_number),
  address: nullableText(form.address),
})

const nullableText = (value) => {
  const trimmedValue = String(value ?? '').trim()

  return trimmedValue === '' ? null : trimmedValue
}

const fieldError = (field) => validationErrors.value[field]?.[0] ?? ''

watch(
  () => route.fullPath,
  () => {
    resetErrors()
    loadedOwner.value = null

    if (!canSubmit.value) {
      resetForm()
      return
    }

    if (isEditing.value) {
      void fetchOwner()
      return
    }

    resetForm()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="pageTitle"
      subtitle="Manage owner contact data and active availability for vehicle assignment."
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
        Your role cannot perform this owner action.
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
            @click="fetchOwner"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading owner...</p>
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
            label="Active owner"
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
              :disabled="saving"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </AppPage>
  </LayoutAuthenticated>
</template>
