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
  mdiTrashCanOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import ownersApi from '@/modules/owners/services/ownersService.js'
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
const { locale, t } = useI18n()

const owner = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const ownerId = computed(() => String(route.params.id ?? ''))
const canUpdateOwner = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canDeleteOwner = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.OWNERS))
const title = computed(() => owner.value?.name ?? t('owners.detail.titleFallback'))
const deleteMessage = computed(() => {
  if (!owner.value) {
    return ''
  }

  return t('owners.delete.confirmMessage', { name: owner.value.name })
})

const fetchOwner = async () => {
  loading.value = true
  errorMessage.value = ''
  owner.value = null

  try {
    owner.value = await ownersApi.show(ownerId.value)
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    loading.value = false
  }
}

const deleteOwner = async () => {
  if (!owner.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await ownersApi.remove(owner.value.id)
    deleteModalOpen.value = false
    await router.push({ name: 'operations-owners' })
  } catch (error) {
    errorMessage.value = normalizeApiError(error).message
  } finally {
    deleting.value = false
  }
}

const statusColor = (isActive) => (isActive ? 'success' : 'danger')
const statusLabel = (isActive) =>
  isActive ? t('owners.status.active') : t('owners.status.inactive')
const formatValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : value

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
  if (!owner.value) {
    return []
  }

  return [
    { icon: mdiAccount, label: t('owners.fields.name'), value: owner.value.name },
    { icon: mdiEmailOutline, label: t('owners.fields.email'), value: owner.value.email },
    {
      icon: mdiPhoneOutline,
      label: t('owners.fields.phone'),
      value: formatValue(owner.value.phone),
    },
    {
      icon: mdiFileDocumentOutline,
      label: t('owners.fields.document'),
      value: formatValue(owner.value.document_number),
    },
    {
      icon: mdiMapMarkerOutline,
      label: t('owners.fields.address'),
      value: formatValue(owner.value.address),
    },
    {
      icon: mdiAccount,
      label: t('owners.fields.updated'),
      value: formatDate(owner.value.updated_at),
    },
  ]
})

watch(
  ownerId,
  () => {
    void fetchOwner()
  },
  { immediate: true },
)
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

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
        <template #right>
          <BaseButton
            color="white"
            :icon="mdiRefresh"
            :title="t('owners.actions.retry')"
            :aria-label="t('owners.actions.retry')"
            small
            @click="fetchOwner"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ t('owners.detail.loading') }}
        </p>
      </CardBox>

      <AppEmptyState
        v-else-if="!owner && !errorMessage"
        :title="t('owners.detail.unavailableTitle')"
        :description="t('owners.detail.unavailableDescription')"
      />

      <div v-else-if="owner" class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
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

    <CardBoxModal
      v-model="deleteModalOpen"
      :title="t('owners.delete.title')"
      button="danger"
      :button-label="t('owners.actions.delete')"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteOwner"
    >
      <p>{{ deleteMessage }}</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>
