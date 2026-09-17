<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountCircleOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiEmailOutline,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import ownersApi from '@/modules/owners/services/ownersService'
import { useAuthStore } from '@/stores/auth'
import type { Owner, OwnerPayload } from '@/types/owner'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const validationErrors = ref<Record<string, string[]>>({})

const form = reactive({
  name: '',
  email: '',
  is_active: true,
  phone: '',
  document_number: '',
  address: '',
})

const isEditing = computed(() => route.name === 'owners-edit')
const ownerId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => (isEditing.value ? 'Editar propietario' : 'Nuevo propietario'))
const pageSubtitle = computed(() =>
  isEditing.value
    ? 'Actualiza la información de contacto y disponibilidad del propietario.'
    : 'Registra un contacto para asociarlo a los vehículos de la flota.',
)
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Registrar propietario'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && ownerId.value
    ? { name: 'owners-detail', params: { id: ownerId.value } }
    : { name: 'owners' },
)
const userName = computed(() => authStore.user?.name || 'Juan Martínez')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''

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

const fillForm = (owner: Owner) => {
  form.name = owner.name || ''
  form.email = owner.email || ''
  form.is_active = owner.is_active
  form.phone = owner.phone || ''
  form.document_number = owner.document_number || ''
  form.address = owner.address || ''
}

const fetchOwner = async () => {
  if (!ownerId.value) {
    loadError.value = 'No se encontró el identificador del propietario.'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    fillForm(await ownersApi.show(ownerId.value))
  } catch (error) {
    loadError.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  const errors: Record<string, string[]> = {}

  if (!form.name.trim()) {
    errors.name = ['El nombre es obligatorio.']
  }

  if (!form.email.trim()) {
    errors.email = ['El correo electrónico es obligatorio.']
  } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = ['Ingresa un correo electrónico válido.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Revisa los campos marcados antes de continuar.'
    return false
  }

  return true
}

const nullableText = (value: string) => value.trim() || null

const buildPayload = (): OwnerPayload => ({
  name: form.name.trim(),
  email: form.email.trim().toLowerCase(),
  is_active: form.is_active,
  phone: nullableText(form.phone),
  document_number: nullableText(form.document_number),
  address: nullableText(form.address),
})

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const owner = isEditing.value
      ? await ownersApi.update(ownerId.value, buildPayload())
      : await ownersApi.create(buildPayload())

    await router.push({ name: 'owners-detail', params: { id: owner.id } })
  } catch (error) {
    const apiError: ApiError = normalizeApiError(error)
    formError.value = apiError.message
    validationErrors.value = apiError.errors ?? {}
  } finally {
    saving.value = false
  }
}

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}

watch(
  () => route.fullPath,
  () => {
    resetForm()
    resetErrors()

    if (isEditing.value) {
      void fetchOwner()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="owners-shell owner-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      :context="pageTitle"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="owners-main">
      <div class="owners-content vehicle-form-content">
        <div class="owner-breadcrumbs">
          <router-link :to="{ name: 'owners' }">Propietarios</router-link>
          <v-icon :icon="mdiArrowLeft" class="owner-breadcrumbs__arrow" size="14" />
          <span>{{ pageTitle }}</span>
        </div>

        <header class="vehicle-form-header">
          <div>
            <span class="page-date">Gestión de contactos</span>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>
          <v-btn :to="backRoute" class="owners-refresh" height="42" variant="outlined">
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Cancelar
          </v-btn>
        </header>

        <v-alert v-if="formError || loadError" class="vehicle-form-alert" type="error" variant="tonal">
          <span>{{ formError || loadError }}</span>
          <template #append>
            <v-btn v-if="loadError && !saving" size="small" variant="text" @click="fetchOwner">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="vehicle-form-loading">
          <v-skeleton-loader type="article, article" />
        </section>

        <section v-else-if="!loadError || !isEditing" class="vehicle-form-layout">
          <form class="vehicle-form-card" @submit.prevent="submitForm">
            <div class="vehicle-form-card__heading">
              <span class="vehicle-form-card__icon">
                <v-icon :icon="mdiAccountCircleOutline" size="20" />
              </span>
              <div>
                <h2>Información del propietario</h2>
                <p>Registra los datos que se utilizarán para asociar vehículos.</p>
              </div>
            </div>

            <div class="vehicle-form-fields">
              <v-text-field
                v-model="form.name"
                :error-messages="fieldError('name')"
                label="Nombre completo"
                maxlength="255"
                placeholder="Ej. María Pérez"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="form.email"
                :error-messages="fieldError('email')"
                label="Correo electrónico"
                maxlength="255"
                placeholder="nombre@empresa.com"
                required
                type="email"
                variant="outlined"
              />
              <v-text-field
                v-model="form.phone"
                label="Teléfono"
                maxlength="50"
                placeholder="Ej. +57 300 123 4567"
                :prepend-inner-icon="mdiPhoneOutline"
                variant="outlined"
              />
              <v-text-field
                v-model="form.document_number"
                label="Documento"
                maxlength="100"
                placeholder="Número de identificación"
                variant="outlined"
              />
            </div>

            <v-textarea
              v-model="form.address"
              auto-grow
              hide-details
              label="Dirección"
              maxlength="500"
              placeholder="Dirección de contacto"
              :prepend-inner-icon="mdiMapMarkerOutline"
              rows="3"
              variant="outlined"
            />

            <v-switch
              v-model="form.is_active"
              color="primary"
              hide-details
              inset
              label="Propietario activo para nuevas asignaciones"
            />

            <div class="vehicle-form-actions">
              <v-btn :to="backRoute" variant="text">Cancelar</v-btn>
              <v-btn color="primary" :loading="saving" type="submit">
                <v-icon :icon="submitIcon" class="mr-2" size="17" />
                {{ submitLabel }}
              </v-btn>
            </div>
          </form>

          <aside class="vehicle-form-aside">
            <span class="vehicle-form-aside__icon">
              <v-icon :icon="mdiCheckCircleOutline" size="21" />
            </span>
            <h2>Contactos listos para operar</h2>
            <p>La información del propietario estará disponible al registrar vehículos y consultar la operación.</p>
            <ul>
              <li>El correo debe ser único y válido.</li>
              <li>Los propietarios inactivos no podrán asignarse a nuevos vehículos.</li>
              <li>Los datos de contacto pueden completarse después.</li>
            </ul>
            <span class="vehicle-form-aside__footer">
              <v-icon :icon="mdiEmailOutline" size="15" /> Mantén actualizados los canales de contacto.
            </span>
          </aside>
        </section>

        <section v-else class="vehicle-form-loading">
          <v-icon :icon="mdiAlertOutline" color="error" size="28" />
          <p>No fue posible cargar el propietario seleccionado.</p>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/vehicle-form.scss" lang="scss"></style>
