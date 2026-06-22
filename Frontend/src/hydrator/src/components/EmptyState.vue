<template>
  <div class="empty-wrapper">
    <div class="empty-card">
      <component :is="icon" class="empty-icon" />
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <button v-if="buttonText" @click="$emit('action')" class="action-btn">
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.empty-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-card {
  text-align: center;
  max-width: 360px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin: 0 auto 16px;
  display: block;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.empty-message {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.action-btn {
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

.action-btn:hover {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
</style>
