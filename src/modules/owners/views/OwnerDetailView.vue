<script setup>
import { computed, ref, watch } from 'vue'
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

const owner = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const ownerId = computed(() => String(route.params.id ?? ''))
const canUpdateOwner = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.OWNERS))
const canDeleteOwner = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.OWNERS))
const title = computed(() => owner.value?.name ?? 'Owner detail')
const deleteMessage = computed(() => {
  if (!owner.value) {
    return ''
  }

  return `This action will delete ${owner.value.name}.`
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
const statusLabel = (isActive) => (isActive ? 'Active' : 'Inactive')
const formatValue = (value) => (value === null || value === undefined || value === '' ? '-' : value)

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const detailItems = computed(() => {
  if (!owner.value) {
    return []
  }

  return [
    { icon: mdiAccount, label: 'Name', value: owner.value.name },
    { icon: mdiEmailOutline, label: 'Email', value: owner.value.email },
    { icon: mdiPhoneOutline, label: 'Phone', value: formatValue(owner.value.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: 'Document',
      value: formatValue(owner.value.document_number),
    },
    { icon: mdiMapMarkerOutline, label: 'Address', value: formatValue(owner.value.address) },
    { icon: mdiAccount, label: 'Updated', value: formatDate(owner.value.updated_at) },
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
      subtitle="Review owner contact details and record availability for operational workflows."
      eyebrow="Operations"
      :icon="mdiAccount"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-owners' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to owners"
          aria-label="Back to owners"
        />
        <BaseButton
          v-if="owner && canUpdateOwner"
          :to="{ name: 'operations-owners-edit', params: { id: owner.id } }"
          color="info"
          :icon="mdiAccountEdit"
          title="Edit owner"
          aria-label="Edit owner"
        />
        <BaseButton
          v-if="owner && canDeleteOwner"
          color="danger"
          :icon="mdiTrashCanOutline"
          title="Delete owner"
          aria-label="Delete owner"
          @click="deleteModalOpen = true"
        />
      </template>

      <NotificationBar v-if="errorMessage" color="danger">
        {{ errorMessage }}
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

      <AppEmptyState
        v-else-if="!owner && !errorMessage"
        title="Owner unavailable"
        description="There is no owner data to display."
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
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">Status</p>
              <AppBadge
                :label="statusLabel(owner.is_active)"
                :color="statusColor(owner.is_active)"
              />
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Vehicle assignment
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                Active owners can be selected when vehicle records are created or updated.
              </p>
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Created
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
      title="Delete owner"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteOwner"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Owner deletion is limited to system administrators by backend policies.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>
