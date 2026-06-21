<template>
  <div class="flex items-center justify-center p-12">
    <div class="text-center max-w-sm">
      <component :is="icon" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-500 text-sm mb-6">{{ message }}</p>
      <button v-if="buttonText" @click="$emit('action')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: any
  title: string
  message: string
  buttonText?: string
}>()

defineEmits<{
  action: []
}>()
</script>
