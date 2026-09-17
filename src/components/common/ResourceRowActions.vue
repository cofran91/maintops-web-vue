<script setup lang="ts">
import {
  mdiDotsVertical,
  mdiOpenInNew,
  mdiPencilOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import type { RouteLocationRaw } from 'vue-router'

withDefaults(defineProps<{
  detailTo?: RouteLocationRaw
  editTo?: RouteLocationRaw
  canUpdate?: boolean
  canDelete?: boolean
  openLabel?: string
  editLabel?: string
  deleteLabel?: string
}>(), {
  canUpdate: false,
  canDelete: false,
  openLabel: 'Abrir detalle',
  editLabel: 'Editar registro',
  deleteLabel: 'Eliminar registro',
})

const emit = defineEmits<{
  (event: 'delete'): void
}>()
</script>

<template>
  <div class="resource-row-actions">
    <v-menu location="bottom end">
      <template #activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          :aria-label="`Acciones: ${openLabel}`"
          class="resource-row-actions__button"
          :icon="mdiDotsVertical"
          size="small"
          variant="text"
        />
      </template>

      <v-list class="resource-row-actions__menu" density="compact" min-width="190">
        <v-list-item v-if="detailTo" :to="detailTo" :prepend-icon="mdiOpenInNew" :title="openLabel" />
        <v-list-item v-if="canUpdate && editTo" :to="editTo" :prepend-icon="mdiPencilOutline" :title="editLabel" />
        <v-list-item v-if="canDelete" :prepend-icon="mdiTrashCanOutline" :title="deleteLabel" @click="emit('delete')" />
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped lang="scss">
.resource-row-actions {
  display: flex;
  justify-content: flex-end;
}

.resource-row-actions__button {
  color: #71809a;
}

.resource-row-actions__menu :deep(.v-list-item-title) {
  font-size: 11px;
}
</style>
