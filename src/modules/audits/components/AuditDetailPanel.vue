<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiClose } from '@mdi/js'
import { buildAuditChangeRows, extractResourceLabel } from '@/modules/audits/utils/auditChanges.js'
import {
  auditFieldLabel,
  displayUrl,
  eventLabel,
  formatAuditValue,
  modelTypeLabel,
} from '@/modules/audits/utils/auditLabels.js'
import { formatDate as formatDateValue } from '@/modules/shared/utils/formatters.js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'

const props = defineProps({
  audit: {
    type: Object,
    required: true,
  },
})

defineEmits(['close'])

const { locale, t } = useI18n()

const changes = computed(() => buildAuditChangeRows(props.audit))

const formatDate = (value) =>
  formatDateValue(value, locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const actorLabel = (actor) => {
  if (!actor || (actor.type === null && actor.id === null)) {
    return {
      type: t('audits.modelTypes.system'),
      detail: '-',
    }
  }

  return {
    type: modelTypeLabel(actor.type, t),
    detail: extractResourceLabel(actor.resource) ?? `#${actor.id}`,
  }
}

const auditableLabel = (auditable) => ({
  type: modelTypeLabel(auditable?.type, t),
  detail: extractResourceLabel(auditable?.resource) ?? `#${auditable?.id ?? '-'}`,
})
</script>

<template>
  <CardBox class="mt-6">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
          {{ t('audits.labels.auditNumber', { id: audit.id }) }}
        </p>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
          {{ eventLabel(audit.event, t) }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-slate-400">
          {{ formatDate(audit.created_at) }}
        </p>
      </div>
      <BaseButton
        color="whiteDark"
        :icon="mdiClose"
        :title="t('audits.actions.closeDetails')"
        :aria-label="t('audits.actions.closeDetails')"
        small
        @click="$emit('close')"
      />
    </div>

    <dl class="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div>
        <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {{ t('audits.detail.actor') }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ actorLabel(audit.actor).type }} -
          {{ actorLabel(audit.actor).detail }}
        </dd>
      </div>
      <div>
        <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {{ t('audits.detail.resource') }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ auditableLabel(audit.auditable).type }} -
          {{ auditableLabel(audit.auditable).detail }}
        </dd>
      </div>
      <div>
        <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {{ t('audits.detail.ipAddress') }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ audit.ip_address ?? '-' }}
        </dd>
      </div>
      <div>
        <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {{ t('audits.detail.tags') }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ audit.tags ?? '-' }}
        </dd>
      </div>
      <div class="md:col-span-2">
        <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {{ t('audits.detail.url') }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ displayUrl(audit.url) }}
        </dd>
      </div>
      <div class="md:col-span-2 xl:col-span-3">
        <dt class="mb-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
          {{ t('audits.detail.userAgent') }}
        </dt>
        <dd class="break-words font-semibold text-gray-900 dark:text-slate-100">
          {{ audit.user_agent ?? '-' }}
        </dd>
      </div>
    </dl>

    <div v-if="changes.length" class="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>{{ t('audits.detail.field') }}</th>
            <th>{{ t('audits.detail.previous') }}</th>
            <th>{{ t('audits.detail.current') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="change in changes" :key="change.field">
            <td :data-label="t('audits.detail.field')">
              <span class="font-semibold">{{ auditFieldLabel(change.field, t) }}</span>
            </td>
            <td :data-label="t('audits.detail.previous')">
              <pre class="whitespace-pre-wrap text-xs">{{ formatAuditValue(change.oldValue, change.field, t) }}</pre>
            </td>
            <td :data-label="t('audits.detail.current')">
              <pre class="whitespace-pre-wrap text-xs">{{ formatAuditValue(change.newValue, change.field, t) }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-sm text-gray-500 dark:text-slate-400">
      {{ t('audits.detail.noValueDifferences') }}
    </p>
  </CardBox>
</template>
