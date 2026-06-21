<template>
  <div class="flex items-center justify-center p-12">
    <div class="text-center">
      <Loader2 class="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
      <p class="text-gray-600 text-sm">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>
