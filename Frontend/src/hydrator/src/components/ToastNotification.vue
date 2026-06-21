<template>
  <Transition name="toast">
    <div v-if="isVisible" :class="toastClasses" class="fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-50">
      <component :is="icon" class="w-5 h-5 flex-shrink-0" />
      <p class="text-sm font-medium">{{ message }}</p>
      <button @click="close" class="ml-auto">
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(props.show)

const icon = computed(() => {
  switch (props.type) {
    case 'success': return CheckCircle2
    case 'error': return XCircle
    case 'warning': return AlertCircle
    default: return Info
  }
})

const toastClasses = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-600 text-white'
    case 'error': return 'bg-red-600 text-white'
    case 'warning': return 'bg-yellow-600 text-white'
    default: return 'bg-indigo-600 text-white'
  }
})

watch(() => props.show, (val) => {
  isVisible.value = val
  if (val && props.duration) {
    setTimeout(() => close(), props.duration)
  }
})

const close = () => {
  isVisible.value = false
  emit('close')
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  opacity: 0;
}
</style>
