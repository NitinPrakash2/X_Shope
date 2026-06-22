<template>
  <Transition name="toast">
    <div v-if="isVisible" :class="['toast-card', toastClass]">
      <component :is="icon" class="toast-icon" />
      <p class="toast-message">{{ message }}</p>
      <button @click="close" class="toast-close">
        <X :size="16" />
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

const toastClass = computed(() => {
  switch (props.type) {
    case 'success': return 'toast-success'
    case 'error': return 'toast-error'
    case 'warning': return 'toast-warning'
    default: return 'toast-info'
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.toast-card {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 14px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 420px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  backdrop-filter: blur(8px);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  opacity: 1;
}

.toast-success {
  background: #059669;
  color: #ffffff;
}

.toast-success .toast-close { color: #ffffff; }

.toast-error {
  background: #e11d48;
  color: #ffffff;
}

.toast-error .toast-close { color: #ffffff; }

.toast-warning {
  background: #d97706;
  color: #ffffff;
}

.toast-warning .toast-close { color: #ffffff; }

.toast-info {
  background: #4f46e5;
  color: #ffffff;
}

.toast-info .toast-close { color: #ffffff; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
