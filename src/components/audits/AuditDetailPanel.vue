<script setup lang="ts">
import { computed } from 'vue'
import { mdiClose, mdiHistory } from '@mdi/js'
import type { AuditLog } from '@/types/audit'
import { buildAuditChangeRows } from '@/modules/audits/utils/auditChanges'
import {
  actorLabel,
  auditFieldLabel,
  auditableLabel,
  displayUrl,
  eventColor,
  eventLabel,
  formatAuditValue,
  modelTypeLabel,
} from '@/modules/audits/utils/auditLabels'

const props = defineProps<{ audit: AuditLog }>()
defineEmits<{ close: [] }>()
const changes = computed(() => buildAuditChangeRows(props.audit))
const date = (value?: string | null) => value
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—'
</script>

<template>
  <v-card class="audit-detail-card" elevation="0">
    <v-card-item>
      <template #prepend><v-avatar color="primary" variant="tonal"><v-icon :icon="mdiHistory" /></v-avatar></template>
      <v-card-title>Auditoría #{{ audit.id }}</v-card-title>
      <v-card-subtitle>{{ date(audit.created_at) }}</v-card-subtitle>
      <template #append><v-btn :aria-label="'Cerrar detalle'" icon variant="text" @click="$emit('close')"><v-icon :icon="mdiClose" /></v-btn></template>
    </v-card-item>
    <v-divider />
    <v-card-text>
      <div class="audit-detail-heading"><v-chip :color="eventColor(audit.event)" label size="small" variant="tonal">{{ eventLabel(audit.event) }}</v-chip><span>{{ modelTypeLabel(audit.auditable?.type) }}</span></div>
      <dl class="audit-detail-grid">
        <div><dt>Actor</dt><dd>{{ actorLabel(audit) }}</dd></div>
        <div><dt>Recurso afectado</dt><dd>{{ auditableLabel(audit) }}</dd></div>
        <div><dt>Etiquetas</dt><dd>{{ audit.tags || '—' }}</dd></div>
        <div><dt>URL</dt><dd class="audit-detail-break">{{ displayUrl(audit.url) }}</dd></div>
        <div class="audit-detail-grid__wide"><dt>User agent</dt><dd class="audit-detail-break">{{ audit.user_agent || '—' }}</dd></div>
      </dl>
      <div class="audit-change-heading"><div><h3>Cambios registrados</h3><p>{{ changes.length ? changes.length + ' campos modificados' : 'Sin diferencias de valores' }}</p></div></div>
      <div v-if="changes.length" class="audit-changes-table-wrap">
        <table class="audit-changes-table"><thead><tr><th>Campo</th><th>Valor anterior</th><th>Valor actual</th></tr></thead><tbody><tr v-for="change in changes" :key="change.field"><td><strong>{{ auditFieldLabel(change.field) }}</strong></td><td><pre>{{ formatAuditValue(change.oldValue, change.field) }}</pre></td><td><pre>{{ formatAuditValue(change.newValue, change.field) }}</pre></td></tr></tbody></table>
      </div>
      <v-alert v-else density="compact" type="info" variant="tonal">Este registro no incluye diferencias de valores anteriores o nuevos.</v-alert>
    </v-card-text>
  </v-card>
</template>
