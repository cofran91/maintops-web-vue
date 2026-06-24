<script setup>
import { ref } from 'vue'
import { mdiChevronDown } from '@mdi/js'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'

defineProps({
  label: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const isOpen = ref(false)

const selectItem = (item) => {
  isOpen.value = false
  emit('select', item)
}
</script>

<template>
  <div class="relative inline-flex">
    <BaseButton color="whiteDark" :label="label" :icon="mdiChevronDown" @click="isOpen = !isOpen" />
    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border border-gray-100 bg-white py-1
        shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <button
        v-for="item in items"
        :key="item.label"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100
          dark:text-slate-200 dark:hover:bg-slate-800"
        type="button"
        @click="selectItem(item)"
      >
        <BaseIcon v-if="item.icon" :path="item.icon" size="16" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
