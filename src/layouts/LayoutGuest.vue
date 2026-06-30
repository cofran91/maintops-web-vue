<script setup>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>

<template>
  <div class="relative bg-gray-50 dark:bg-slate-800 dark:text-slate-100">
    <div class="fixed right-4 top-4 z-20">
      <LanguageSwitcher compact />
    </div>
    <slot />
  </div>
</template>
