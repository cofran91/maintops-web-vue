<script setup>
import { containerMaxW } from '@/config.js'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="px-6 py-2" :class="containerMaxW">
    <div class="py-2 text-center text-sm text-gray-500 lg:text-left dark:text-slate-400">
      &copy;{{ year }} MaintOps
    </div>
  </footer>
</template>
