<script setup>
import { computed } from 'vue'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import CardBox from '@/components/CardBox.vue'

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
  perPageOptions: {
    type: Array,
    required: true,
  },
  inputClass: {
    type: String,
    required: true,
  },
  showingLabel: {
    type: String,
    required: true,
  },
  pageLabel: {
    type: String,
    required: true,
  },
  previousLabel: {
    type: String,
    required: true,
  },
  nextLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-page', 'update-per-page'])

const canGoPrevious = computed(() => props.pagination.current_page > 1)
const canGoNext = computed(() => props.pagination.current_page < props.pagination.last_page)

const updatePerPage = (event) => {
  emit('update-per-page', Number(event.target.value))
}
</script>

<template>
  <CardBox v-if="pagination.total > 0" class="mt-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p class="text-sm text-gray-500 dark:text-slate-400">
        {{ showingLabel }}
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <select
          :value="pagination.per_page"
          :class="inputClass"
          class="max-w-28"
          @change="updatePerPage"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <BaseButton
          color="whiteDark"
          :icon="mdiChevronLeft"
          :title="previousLabel"
          :aria-label="previousLabel"
          small
          :disabled="!canGoPrevious"
          @click="canGoPrevious ? $emit('update-page', pagination.current_page - 1) : null"
        />
        <span class="px-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
          {{ pageLabel }}
        </span>
        <BaseButton
          color="whiteDark"
          :icon="mdiChevronRight"
          :title="nextLabel"
          :aria-label="nextLabel"
          small
          :disabled="!canGoNext"
          @click="canGoNext ? $emit('update-page', pagination.current_page + 1) : null"
        />
      </div>
    </div>
  </CardBox>
</template>
