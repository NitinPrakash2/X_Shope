<template>
  <div class="flex items-center justify-center p-12">
    <div class="text-center max-w-md">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-600 text-sm mb-6">{{ message }}</p>
      <button v-if="showRetry" @click="$emit('retry')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineProps<{
  title?: string
  message: string
  showRetry?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>
