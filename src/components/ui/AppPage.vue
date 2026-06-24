<script setup>
import { computed, useSlots } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import SectionMain from '@/components/SectionMain.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: String,
  eyebrow: String,
  icon: String,
})

const slots = useSlots()

const hasActions = computed(() => !!slots.actions)
</script>

<template>
  <SectionMain>
    <header class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex min-w-0 gap-3">
        <div
          v-if="icon"
          class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-blue-50 text-blue-600
            dark:bg-slate-900 dark:text-blue-300"
        >
          <BaseIcon :path="icon" size="24" />
        </div>
        <div class="min-w-0">
          <p v-if="eyebrow" class="text-xs font-semibold uppercase text-blue-600 dark:text-blue-300">
            {{ eyebrow }}
          </p>
          <h1
            class="break-words text-2xl font-semibold text-gray-900 dark:text-slate-100 md:text-3xl"
          >
            {{ title }}
          </h1>
          <p v-if="subtitle" class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-slate-400">
            {{ subtitle }}
          </p>
        </div>
      </div>
      <div v-if="hasActions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <slot />
  </SectionMain>
</template>
