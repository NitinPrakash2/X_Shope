<template>
  <div class="loading-wrapper">
    <div class="loading-card">
      <Loader2 class="spinner" />
      <p class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.loading-card {
  text-align: center;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.spinner {
  width: 32px;
  height: 32px;
  color: #4f46e5;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
  display: block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-message {
  color: #64748b;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}
</style>
