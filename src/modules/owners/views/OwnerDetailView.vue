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
  mdiTrashCanOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { useResourceDetail } from '@/modules/shared/composables/useResourceDetail.js'
import { emptyFallback, formatDate as formatDateValue } from '@/modules/shared/utils/formatters.js'
import ownersApi from '@/modules/owners/services/ownersService.js'
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
const { locale, t } = useI18n()

const {
  resource: owner,
  loading,
  deleting,
  errorMessage,
  deleteModalOpen,
  fetchResource: fetchOwner,
  deleteResource: deleteOwner,
} = useResourceDetail({
  fetcher: ownersApi.show,
  remover: ownersApi.remove,
  redirectTo: { name: 'operations-owners' },
})

const canUpdateOwner = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canDeleteOwner = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.OWNERS))
const title = computed(() => owner.value?.name ?? t('owners.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!owner.value) {
    return ''
  }

  return t('owners.delete.confirmMessage', { name: owner.value.name })
})

const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('owners.status.active') : t('owners.status.inactive')

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const detailItems = computed(() => {
  if (!owner.value) {
    return []
  }

  return [
    { icon: mdiAccount, label: t('owners.fields.name'), value: owner.value.name },
    { icon: mdiEmailOutline, label: t('owners.fields.email'), value: owner.value.email },
    {
      icon: mdiPhoneOutline,
      label: t('owners.fields.phone'),
      value: emptyFallback(owner.value.phone),
    },
    {
      icon: mdiFileDocumentOutline,
      label: t('owners.fields.document'),
      value: emptyFallback(owner.value.document_number),
    },
    {
      icon: mdiMapMarkerOutline,
      label: t('owners.fields.address'),
      value: emptyFallback(owner.value.address),
    },
    {
      icon: mdiAccount,
      label: t('owners.fields.updated'),
      value: formatDate(owner.value.updated_at),
    },
  ]
})
</script>

<template>
  <LayoutAuthenticated>
    <AppPage
      :title="title"
      :subtitle="t('owners.detail.subtitle')"
      :eyebrow="t('owners.page.eyebrow')"
      :icon="mdiAccount"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-owners' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          :title="t('owners.actions.backToOwners')"
          :aria-label="t('owners.actions.backToOwners')"
        />
        <BaseButton
          v-if="owner && canUpdateOwner"
          :to="{ name: 'operations-owners-edit', params: { id: owner.id } }"
          color="info"
          :icon="mdiAccountEdit"
          :title="t('owners.actions.editOwner')"
          :aria-label="t('owners.actions.editOwner')"
        />
        <BaseButton
          v-if="owner && canDeleteOwner"
          color="danger"
          :icon="mdiTrashCanOutline"
          :title="t('owners.actions.deleteOwner')"
          :aria-label="t('owners.actions.deleteOwner')"
          @click="deleteModalOpen = true"
        />
      </template>

      <ResourceListStatus
        :error-message="errorMessage"
        :loading="loading"
        :loading-label="t('owners.detail.loading')"
        :retry-label="t('owners.actions.retry')"
        @retry="fetchOwner"
      />

      <AppEmptyState
        v-if="!loading && !owner && !errorMessage"
        :title="t('owners.detail.unavailableTitle')"
        :description="t('owners.detail.unavailableDescription')"
      />

      <div v-if="!loading && owner" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
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
                {{ t('owners.fields.status') }}
              </p>
              <AppBadge
                :label="statusLabel(owner.is_active)"
                :color="statusColor(owner.is_active)"
              />
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('owners.fields.vehicleAssignment') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                {{ t('owners.detail.vehicleAssignmentDescription') }}
              </p>
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                {{ t('owners.fields.created') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                {{ formatDate(owner.created_at) }}
              </p>
            </div>
          </div>
        </CardBox>
      </div>
    </AppPage>

    <DeleteResourceModal
      v-model="deleteModalOpen"
      :title="t('owners.delete.title')"
      :delete-label="t('owners.actions.delete')"
      :message="deleteMessage"
      :processing="deleting"
      @confirm="deleteOwner"
    />
  </LayoutAuthenticated>
</template>
