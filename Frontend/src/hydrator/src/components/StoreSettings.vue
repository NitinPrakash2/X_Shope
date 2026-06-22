<template>
  <div class="page-container">
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

          <div class="form-row">
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
            <button type="submit" :disabled="saving" class="primary-btn">
              <Loader2 v-if="saving" :size="18" class="animate-spin" />
              <Save v-else :size="18" />
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-container {
  min-height: 100vh;
  background: #fcfcfd;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #f3f4f6;
  padding: 24px 32px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 32px;
}

.settings-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.01);
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
  flex: 1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #e11d48;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
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

.primary-btn:hover:not(:disabled) {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
