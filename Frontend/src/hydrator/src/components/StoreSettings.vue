<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Store Settings</h1>
          <p class="page-subtitle">Manage your store information</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <LoadingState v-if="loading" message="Loading store details..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadStore" />

      <div v-else class="settings-card">
        <form @submit.prevent="saveStore" class="settings-form">
          <div class="form-group">
            <label class="form-label">
              Store Name
              <span class="required">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="My Awesome Store"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Tell customers about your store..."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Contact Email</label>
            <input
              v-model="form.contact_email"
              type="email"
              placeholder="contact@store.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Support Number</label>
            <input
              v-model="form.support_number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Website URL</label>
            <input
              v-model="form.website_url"
              type="url"
              placeholder="https://mystore.com"
              class="form-input"
            />
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="saving" class="save-btn">
              <Loader2 v-if="saving" :size="20" class="animate-spin" />
              <Save v-else :size="20" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ToastNotification :show="toast.show" :type="toast.type" :message="toast.message" @close="toast.show = false" :duration="3000" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, Loader2 } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import ToastNotification from '../components/ToastNotification.vue'

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const storeExists = ref(false)
const form = ref({
  name: '',
  description: '',
  contact_email: '',
  support_number: '',
  website_url: ''
})
const toast = ref({ show: false, type: 'info' as any, message: '' })

const loadStore = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await xshop.getStore()
    if (res.data?.status === 'success' && res.data.output) {
      storeExists.value = true
      form.value = {
        name: res.data.output.name || '',
        description: res.data.output.description || '',
        contact_email: res.data.output.contact_email || '',
        support_number: res.data.output.support_number || '',
        website_url: res.data.output.website_url || ''
      }
    }
  } catch (e: any) {
    if (e.response?.status === 404) {
      storeExists.value = false
    } else {
      error.value = e.response?.data?.detail || 'Failed to load store'
    }
  } finally {
    loading.value = false
  }
}

const saveStore = async () => {
  if (!form.value.name.trim()) {
    toast.value = { show: true, type: 'error', message: 'Store name is required' }
    return
  }

  saving.value = true
  try {
    const apiCall = storeExists.value ? xshop.updateStore : xshop.createStore
    const res = await apiCall(form.value)
    
    if (res.data?.status === 'success') {
      storeExists.value = true
      toast.value = { show: true, type: 'success', message: 'Store saved successfully' }
    }
  } catch (e: any) {
    toast.value = { show: true, type: 'error', message: e.response?.data?.detail || 'Failed to save store' }
  } finally {
    saving.value = false
  }
}

onMounted(() => loadStore())
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f9fafb;
}

.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 32px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

.settings-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  transition: border 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 32px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #4338ca;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
