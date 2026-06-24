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
  mdiShieldAccountOutline,
  mdiTrashCanOutline,
  mdiWrenchOutline,
} from '@mdi/js'
import { RESOURCES, canDeleteForAnyRole, canUpdateForAnyRole } from '@/auth/permissions.js'
import { normalizeApiError } from '@/api/errors.js'
import { ROLE_LABELS } from '@/types/auth.js'
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

const user = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const userId = computed(() => String(route.params.id ?? ''))
const canUpdateUser = computed(() => canUpdateForAnyRole(authStore.roles, RESOURCES.USERS))
const canDeleteUser = computed(() => canDeleteForAnyRole(authStore.roles, RESOURCES.USERS))
const title = computed(() => user.value?.name ?? 'User detail')
const deleteMessage = computed(() => {
  if (!user.value) {
    return ''
  }

  return `This action will delete ${user.value.name}.`
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
const roleLabel = (role) => (role ? ROLE_LABELS[role] ?? role : '-')
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
  if (!user.value) {
    return []
  }

  return [
    { icon: mdiAccount, label: 'Name', value: user.value.name },
    { icon: mdiEmailOutline, label: 'Email', value: user.value.email },
    { icon: mdiShieldAccountOutline, label: 'Role', value: roleLabel(primaryRole(user.value)) },
    { icon: mdiPhoneOutline, label: 'Phone', value: formatValue(user.value.phone) },
    {
      icon: mdiFileDocumentOutline,
      label: 'Document',
      value: formatValue(user.value.document_number),
    },
    { icon: mdiMapMarkerOutline, label: 'Address', value: formatValue(user.value.address) },
    {
      icon: mdiWrenchOutline,
      label: 'Workshop',
      value: user.value.workshop?.name ?? user.value.workshop?.code ?? '-',
    },
    { icon: mdiAccount, label: 'Updated', value: formatDate(user.value.updated_at) },
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
      subtitle="Review role, status, contact data, and workshop assignment."
      eyebrow="Operations"
      :icon="mdiAccount"
    >
      <template #actions>
        <BaseButton
          :to="{ name: 'operations-users' }"
          color="whiteDark"
          :icon="mdiArrowLeft"
          title="Back to users"
          aria-label="Back to users"
        />
        <BaseButton
          v-if="user && canUpdateUser"
          :to="{ name: 'operations-users-edit', params: { id: user.id } }"
          color="info"
          :icon="mdiAccountEdit"
          title="Edit user"
          aria-label="Edit user"
        />
        <BaseButton
          v-if="user && canDeleteUser"
          color="danger"
          :icon="mdiTrashCanOutline"
          title="Delete user"
          aria-label="Delete user"
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
            @click="fetchUser"
          />
        </template>
      </NotificationBar>

      <CardBox v-if="loading">
        <p class="text-sm text-gray-500 dark:text-slate-400">Loading user...</p>
      </CardBox>

      <AppEmptyState
        v-else-if="!user && !errorMessage"
        title="User unavailable"
        description="There is no user data to display."
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
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">Status</p>
              <AppBadge :label="statusLabel(user.is_active)" :color="statusColor(user.is_active)" />
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Workshop assignment
              </p>
              <p class="text-sm text-gray-700 dark:text-slate-200">
                {{ user.workshop?.name ?? user.workshop?.code ?? 'No workshop assigned' }}
              </p>
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                Created
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
      title="Delete user"
      button="danger"
      button-label="Delete"
      :button-icon="mdiTrashCanOutline"
      :cancel-icon="mdiClose"
      has-cancel
      :is-processing="deleting"
      @confirm="deleteUser"
    >
      <p>{{ deleteMessage }}</p>
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Users cannot delete themselves and backend policies still authorize the operation.
      </p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>
