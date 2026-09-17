<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountCircleOutline,
  mdiAlertOutline,
  mdiArrowLeft,
  mdiCheckCircleOutline,
  mdiContentSaveOutline,
  mdiEmailOutline,
  mdiFileDocumentOutline,
  mdiGarageVariant,
  mdiLockOutline,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { normalizeApiError, type ApiError } from '@/api/errors'
import usersApi from '@/modules/users/services/usersService'
import workshopsApi from '@/modules/workshops/services/workshopsService'
import { useAuthStore } from '@/stores/auth'
import type { User, UserPayload, UserWorkshop } from '@/types/user'
import type { Workshop } from '@/types/workshop'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const workshopLoadError = ref('')
const validationErrors = ref<Record<string, string[]>>({})
const loadingWorkshops = ref(false)
const workshops = ref<Workshop[]>([])
const selectedWorkshop = ref<UserWorkshop | null>(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  document_number: '',
  address: '',
  workshop_id: null as number | null,
  role: '',
  password: '',
  password_confirmation: '',
  is_active: true,
})

const roleOptions = [
  { title: 'Administrador', value: 'admin' },
  { title: 'Asesor', value: 'advisor' },
  { title: 'Responsable de taller', value: 'workshop_manager' },
  { title: 'Técnico', value: 'technician' },
]

const isEditing = computed(() => route.name === 'users-edit')
const userId = computed(() => String(route.params.id ?? ''))
const pageTitle = computed(() => (isEditing.value ? 'Editar usuario' : 'Nuevo usuario'))
const pageSubtitle = computed(() =>
  isEditing.value
    ? 'Actualiza la información del perfil y sus credenciales de acceso.'
    : 'Registra un perfil para incorporarlo al equipo de operación.',
)
const submitLabel = computed(() => (isEditing.value ? 'Guardar cambios' : 'Registrar usuario'))
const submitIcon = computed(() => (isEditing.value ? mdiContentSaveOutline : mdiPlus))
const backRoute = computed(() =>
  isEditing.value && userId.value
    ? { name: 'users-detail', params: { id: userId.value } }
    : { name: 'users' },
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
const isSystemAdmin = computed(() =>
  authStore.roles.some((role) => ['super_admin', 'admin', 'system_admin'].includes(role)),
)
const showWorkshopField = computed(
  () => isSystemAdmin.value && form.role === 'technician',
)
const workshopOptions = computed(() => {
  const options: Array<Workshop | UserWorkshop> = [...workshops.value]

  if (
    selectedWorkshop.value &&
    !options.some((workshop) => workshop.id === selectedWorkshop.value?.id)
  ) {
    options.unshift(selectedWorkshop.value)
  }

  return options.map((workshop) => ({
    ...workshop,
    title: [workshop.code, workshop.name].filter(Boolean).join(' - '),
    subtitle: workshop.city || 'Ciudad no registrada',
  }))
})

const fieldError = (field: string) => validationErrors.value[field]?.[0] || ''

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.document_number = ''
  form.address = ''
  form.workshop_id = null
  selectedWorkshop.value = null
  form.role = ''
  form.password = ''
  form.password_confirmation = ''
  form.is_active = true
}

const resetErrors = () => {
  loadError.value = ''
  formError.value = ''
  workshopLoadError.value = ''
  validationErrors.value = {}
}

const fillForm = (user: User) => {
  form.name = user.name || ''
  form.email = user.email || ''
  form.phone = user.phone || ''
  form.document_number = user.document_number || ''
  form.address = user.address || ''
  form.workshop_id = user.workshop_id ?? null
  selectedWorkshop.value = user.workshop ?? null
  form.role = user.role || user.roles?.[0] || ''
  form.password = ''
  form.password_confirmation = ''
  form.is_active = user.is_active
}

const loadWorkshops = async () => {
  loadingWorkshops.value = true
  workshopLoadError.value = ''

  try {
    workshops.value = (
      await workshopsApi.index({ is_active: true, page: 1, per_page: 100 })
    ).items
  } catch (error) {
    workshopLoadError.value = normalizeApiError(error).message
  } finally {
    loadingWorkshops.value = false
  }
}

const fetchUser = async () => {
  if (!userId.value) {
    loadError.value = 'No se encontró el identificador del usuario.'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    fillForm(await usersApi.show(userId.value))
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

  if (!form.role) {
    errors.role = ['Selecciona un rol operativo.']
  }

  if (!isEditing.value && !form.password.trim()) {
    errors.password = ['La contraseña es obligatoria al crear un usuario.']
  }

  if (form.password.trim() && form.password.trim().length < 8) {
    errors.password = ['La contraseña debe tener al menos 8 caracteres.']
  }

  if (form.password.trim() !== form.password_confirmation.trim()) {
    errors.password_confirmation = ['Las contraseñas no coinciden.']
  }

  validationErrors.value = errors

  if (Object.keys(errors).length > 0) {
    formError.value = 'Revisa los campos marcados antes de continuar.'
    return false
  }

  return true
}

const nullableText = (value: string) => value.trim() || null

const buildPayload = (): UserPayload => {
  const payload: UserPayload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: nullableText(form.phone),
    document_number: nullableText(form.document_number),
    address: nullableText(form.address),
    workshop_id: showWorkshopField.value ? form.workshop_id : null,
    role: form.role,
    is_active: form.is_active,
  }

  if (form.password.trim()) {
    payload.password = form.password.trim()
    payload.password_confirmation = form.password_confirmation.trim()
  }

  return payload
}

const submitForm = async () => {
  resetErrors()

  if (!validateForm()) {
    return
  }

  saving.value = true

  try {
    const user = isEditing.value
      ? await usersApi.update(userId.value, buildPayload())
      : await usersApi.create(buildPayload())

    await router.push({ name: 'users-detail', params: { id: user.id } })
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
      void fetchUser()
    }
  },
  { immediate: true },
)

watch(
  () => form.role,
  (role) => {
    if (role !== 'technician') {
      form.workshop_id = null
      selectedWorkshop.value = null
    }
  },
)

onMounted(() => {
  if (isSystemAdmin.value) {
    void loadWorkshops()
  }
})
</script>

<template>
  <div class="users-shell user-form-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />

    <AppTopbar
      :user-initials="userInitials"
      :user-name="userName"
      :context="pageTitle"
      @open-menu="mobileDrawer = true"
    />

    <v-main class="users-main">
      <div class="users-content vehicle-form-content">
        <div class="user-form-breadcrumbs">
          <router-link :to="{ name: 'users' }">Usuarios</router-link>
          <v-icon :icon="mdiArrowLeft" class="user-form-breadcrumbs__arrow" size="14" />
          <span>{{ pageTitle }}</span>
        </div>

        <header class="vehicle-form-header">
          <div>
            <span class="page-date">Gestión de equipo</span>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>
          <v-btn :to="backRoute" class="users-refresh" height="42" variant="outlined">
            <v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />
            Cancelar
          </v-btn>
        </header>

        <v-alert v-if="formError || loadError" class="vehicle-form-alert" type="error" variant="tonal">
          <span>{{ formError || loadError }}</span>
          <template #append>
            <v-btn v-if="loadError && !saving" size="small" variant="text" @click="fetchUser">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar
            </v-btn>
          </template>
        </v-alert>

        <v-alert v-if="workshopLoadError" class="vehicle-form-alert" type="warning" variant="tonal">
          <span>No fue posible cargar los talleres: {{ workshopLoadError }}</span>
          <template #append>
            <v-btn size="small" variant="text" @click="loadWorkshops">
              <v-icon :icon="mdiRefresh" class="mr-1" size="15" />
              Reintentar talleres
            </v-btn>
          </template>
        </v-alert>

        <section v-if="loading" class="vehicle-form-loading">
          <v-skeleton-loader type="article, article" />
        </section>

        <section v-else-if="!loadError || !isEditing" class="vehicle-form-layout">
          <form class="vehicle-form-card user-form-card" @submit.prevent="submitForm">
            <div class="vehicle-form-card__heading">
              <span class="vehicle-form-card__icon">
                <v-icon :icon="mdiAccountCircleOutline" size="20" />
              </span>
              <div>
                <h2>Información del usuario</h2>
                <p>Define los datos del perfil y el nivel operativo que tendrá en MaintOps.</p>
              </div>
            </div>

            <div class="vehicle-form-fields">
              <v-text-field
                v-model="form.name"
                :error-messages="fieldError('name')"
                label="Nombre completo"
                maxlength="255"
                placeholder="Ej. Carlos Rodríguez"
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
                :prepend-inner-icon="mdiEmailOutline"
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
                :error-messages="fieldError('document_number')"
                label="Documento"
                maxlength="100"
                placeholder="Ej. 1020304050"
                :prepend-inner-icon="mdiFileDocumentOutline"
                variant="outlined"
              />
              <v-select
                v-model="form.role"
                :error-messages="fieldError('role')"
                item-title="title"
                item-value="value"
                label="Rol operativo"
                :items="roleOptions"
                required
                variant="outlined"
              />
              <v-autocomplete
                v-if="showWorkshopField"
                v-model="form.workshop_id"
                :error-messages="fieldError('workshop_id')"
                item-title="title"
                item-value="id"
                label="Taller asignado"
                :items="workshopOptions"
                :loading="loadingWorkshops"
                placeholder="Selecciona el taller del técnico"
                :prepend-inner-icon="mdiGarageVariant"
                clearable
                variant="outlined"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
                </template>
              </v-autocomplete>
              <v-textarea
                v-model="form.address"
                :error-messages="fieldError('address')"
                class="user-form-field--wide"
                label="Dirección"
                maxlength="500"
                placeholder="Dirección de residencia o contacto"
                :prepend-inner-icon="mdiMapMarkerOutline"
                rows="2"
                auto-grow
                variant="outlined"
              />
            </div>

            <div class="user-form-section-heading">
              <div>
                <h3>Credenciales de acceso</h3>
                <p>{{ isEditing ? 'Deja la contraseña vacía si no deseas cambiarla.' : 'Crea una contraseña segura para el nuevo usuario.' }}</p>
              </div>
              <v-icon :icon="mdiLockOutline" color="#3158e7" size="20" />
            </div>

            <div class="vehicle-form-fields">
              <v-text-field
                v-model="form.password"
                :error-messages="fieldError('password')"
                :label="isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'"
                minlength="8"
                placeholder="Mínimo 8 caracteres"
                :prepend-inner-icon="mdiLockOutline"
                type="password"
                variant="outlined"
              />
              <v-text-field
                v-model="form.password_confirmation"
                :error-messages="fieldError('password_confirmation')"
                label="Confirmar contraseña"
                minlength="8"
                placeholder="Repite la contraseña"
                :prepend-inner-icon="mdiLockOutline"
                type="password"
                variant="outlined"
              />
            </div>

            <v-switch
              v-model="form.is_active"
              color="primary"
              hide-details
              inset
              label="Usuario activo para iniciar sesión"
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
            <h2>Equipo listo para operar</h2>
            <p>Un perfil correctamente configurado recibe los permisos necesarios según su función.</p>
            <ul>
              <li>El correo se normaliza en minúsculas.</li>
              <li>La contraseña debe tener al menos 8 caracteres.</li>
              <li>Los técnicos pueden quedar asociados a un taller activo.</li>
              <li>Los usuarios inactivos no podrán iniciar sesión.</li>
            </ul>
            <span class="vehicle-form-aside__footer">
              <v-icon :icon="mdiAlertOutline" size="15" /> Los campos marcados son necesarios para guardar.
            </span>
          </aside>
        </section>

        <section v-else class="vehicle-form-loading">
          <v-icon :icon="mdiAlertOutline" color="error" size="28" />
          <p>No fue posible cargar el usuario seleccionado.</p>
        </section>
      </div>
    </v-main>
  </div>
</template>

<style src="@/styles/views/user-form.scss" lang="scss"></style>
