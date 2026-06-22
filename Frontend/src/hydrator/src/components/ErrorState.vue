<template>
  <div class="error-wrapper">
    <div class="error-card">
      <AlertCircle class="error-icon" />
      <h3 class="error-title">{{ title || 'Something went wrong' }}</h3>
      <p class="error-message">{{ message }}</p>
      <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.error-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.error-card {
  text-align: center;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #e11d48;
  margin: 0 auto 16px;
  display: block;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.error-message {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.retry-btn {
  padding: 10px 24px;
  background: #111827;
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.retry-btn:hover {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
</style>
