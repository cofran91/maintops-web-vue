<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  mdiAccount,
  mdiAccountEdit,
  mdiArrowLeft,
  mdiEmailOutline,
  mdiFileDocumentOutline,
  mdiMapMarkerOutline,
  mdiPhoneOutline,
  mdiShieldAccountOutline,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { useResourceDetail } from '@/modules/shared/composables/useResourceDetail.js'
import { emptyFallback, formatDate as formatDateValue } from '@/modules/shared/utils/formatters.js'
import usersApi from '@/modules/users/services/usersService.js'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPage from '@/components/ui/AppPage.vue'
import DeleteResourceModal from '@/modules/shared/components/DeleteResourceModal.vue'
import ResourceListStatus from '@/modules/shared/components/ResourceListStatus.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const { locale, t, te } = useI18n()

const {
  resource: user,
  loading,
  deleting,
  errorMessage,
  deleteModalOpen,
  fetchResource: fetchUser,
  deleteResource: deleteUser,
} = useResourceDetail({
  fetcher: usersApi.show,
  remover: usersApi.remove,
  redirectTo: { name: 'operations-users' },
})

const canUpdateUser = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.USERS))
const canDeleteUser = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.USERS))
const title = computed(() => user.value?.name ?? t('users.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!user.value) {
    return ''
  }

  return t('users.delete.confirmMessage', { name: user.value.name })
})

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

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

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
    { icon: mdiPhoneOutline, label: t('users.fields.phone'), value: emptyFallback(user.value.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: t('users.fields.document'),
      value: emptyFallback(user.value.document_number),
    },
    {
      icon: mdiMapMarkerOutline,
      label: t('users.fields.address'),
      value: emptyFallback(user.value.address),
    },
    {
      icon: mdiWrenchOutline,
      label: t('users.fields.workshop'),
      value: user.value.workshop?.name ?? user.value.workshop?.code ?? '-',
    },
    {
      icon: mdiAccount,
      label: t('users.fields.updated'),
      value: formatDate(user.value.updated_at),
    },
  ]
})
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

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('users.detail.loading')"
        :retry-label="t('users.actions.retry')"
        @retry="fetchUser"
      />

      <AppEmptyState
        v-if="!loading && !user && !errorMessage"
        :title="t('users.detail.unavailableTitle')"
        :description="t('users.detail.unavailableDescription')"
      />

      <div v-if="!loading && user" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
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

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('users.delete.title')"
      :delete-label="t('users.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteUser"
    >
      <p class="text-sm text-gray-500 dark:text-slate-400">
        {{ t('users.delete.selfDeleteNote') }}
      </p>
    </DeleteResourceModal>
  </LayoutAuthenticated>
</template>
