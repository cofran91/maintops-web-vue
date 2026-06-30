<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccount,
  mdiAccountEdit,
  mdiArrowLeft,
  mdiClose,
  mdiEmailOutline,
  mdiFileDocumentOutline,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiRefresh,
  mdiShieldAccountOutline,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import usersApi from '@/modules/users/services/usersService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale, t, te } = useI18n()

const user = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const userId = computed(() => String(route.params.id ?? ''))
const canUpdateUser = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.USERS))
const canDeleteUser = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.USERS))
const title = computed(() => user.value?.name ?? t('users.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!user.value) {
    return ''
  }

  return t('users.delete.confirmMessage', { name: user.value.name })
})

const fetchUser = async () => {
  loading.value = true
  errorMessage.value = ''
  user.value = null

  try {
    user.value = await usersApi.show(userId.value)
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const deleteUser = async () => {
  if (!user.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await usersApi.remove(user.value.id)
    deleteModalOpen.value = false
    await router.push({ name: 'operations-users' })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const primaryRole = (value) => value?.roles?.[0] ?? null
const humanizeRole = (role) => String(role ?? '').replace(/_/g, ' ')
const roleLabel = (role) => {
  if (!role) {
    return '-'
  }

  const key = `users.roles.${role}`

  return te(key) ? t(key) : humanizeRole(role)
}
const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('users.status.active') : t('users.status.inactive')
const formatValue = (value) => (value === null || value === undefined || value === '' ? '-' : value)

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const detailItems = computed(() => {
  if (!user.value) {
    return []
  }

  return [
    { icon: mdiAccount, label: t('users.fields.name'), value: user.value.name },
    { icon: mdiEmailOutline, label: t('users.fields.email'), value: user.value.email },
    {
      icon: mdiShieldAccountOutline,
      label: t('users.fields.role'),
      value: roleLabel(primaryRole(user.value)),
    },
    { icon: mdiPhoneOutline, label: t('users.fields.phone'), value: formatValue(user.value.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: t('users.fields.document'),
      value: formatValue(user.value.document_number),
    },
    {
      icon: mdiMapMarkerOutline,
      label: t('users.fields.address'),
      value: formatValue(user.value.address),
    },
    {
      icon: mdiWrenchOutline,
      label: t('users.fields.workshop'),
      value: user.value.workshop?.name ?? user.value.workshop?.code ?? '-',
    },
    { icon: mdiAccount, label: t('users.fields.updated'), value: formatDate(user.value.updated_at) },
  ]
})

watch(
  userId,
  () => {
    void fetchUser()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('users.detail.subtitle')"
      :eyebrow="t('users.page.eyebrow')"
      :icon="mdiAccount"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-users' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('users.actions.backToUsers')"
          :aria-label="t('users.actions.backToUsers')"
        />
        <BaseButton
          v-if="user && canUpdateUser"
          :to="{ name: 'operations-users-edit', params: { id: user.id } }"
          color="info"
          :icon="mdiAccountEdit"
          :title="t('users.actions.editUser')"
          :aria-label="t('users.actions.editUser')"
        />
        <BaseButton
          v-if="user && canDeleteUser"
          color="danger"
          :icon="mdiTrashCanOutline"
          :title="t('users.actions.deleteUser')"
          :aria-label="t('users.actions.deleteUser')"
          @click="deleteModalOpen = true"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
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

      <AppEmptyState
        v-else-if="!user && !errorMessage"
        :title="t('users.detail.unavailableTitle')"
        :description="t('users.detail.unavailableDescription')"
      />

      <div v-else-if="user" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
        <CardBox>
          <dl class="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div v-for="item in detailItems" :key="item.label">
              <dt
                class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-500
                  dark:text-slate-400"
              >
                <BaseIcon :path="item.icon" size="16" />
                {{ item.label }}
              </dt>
              <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </CardBox>

        <CardBox>
          <div class="space-y-5">
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('users.fields.status') }}
              </p>
              <AppBadge :label="statusLabel(user.is_active)" :color="statusColor(user.is_active)" />
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('users.fields.workshopAssignment') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                {{ user.workshop?.name ?? user.workshop?.code ?? t('users.labels.noWorkshopAssigned') }}
              </p>
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('users.fields.created') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                {{ formatDate(user.created_at) }}
              </p>
            </div>
          </div>
        </CardBox>
      </div>
    </AppPage>

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('users.delete.title')"
      button="danger"
      :button-label="t('users.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteUser"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        {{ t('users.delete.selfDeleteNote') }}
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>
