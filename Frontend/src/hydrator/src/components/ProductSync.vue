<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Product Sync</h1>
          <p class="page-subtitle">Sync your external inventory securely and seamlessly.</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="sync-banner">
        <div class="banner-info">
          <div class="banner-icon">
            <RefreshCw :size="24" stroke-width="2" />
          </div>
          <div>
            <h2 class="banner-title">Sync Products Now</h2>
            <p class="banner-desc">Fetch the latest products from your external API and update your local inventory.</p>
          </div>
        </div>
        <button @click="syncNow" :disabled="syncing" class="sync-btn">
          <Loader2 v-if="syncing" :size="18" class="animate-spin" stroke-width="2" />
          <RefreshCw v-else :size="18" stroke-width="2" />
          <span>{{ syncing ? 'Syncing...' : 'Start Sync' }}</span>
        </button>
      </div>

      <div class="grid-container">
        <div v-if="lastSync" class="dashboard-card status-card">
          <div class="card-header">
            <h3 class="card-title">Last Sync Status</h3>
          </div>
          <div class="card-content status-content">
            <div class="status-main">
              <div class="status-icon-wrapper" :class="lastSync.status === 'success' ? 'success' : 'error'">
                <CheckCircle2 v-if="lastSync.status === 'success'" :size="22" stroke-width="2" />
                <XCircle v-else :size="22" stroke-width="2" />
              </div>
              <div class="status-text">
                <p class="status-label">{{ lastSync.status === 'success' ? 'Successful' : 'Failed' }}</p>
                <p class="status-time">{{ formatDate(lastSync.created_at) }}</p>
              </div>
            </div>
            <div class="status-metrics">
              <p class="metric-value">{{ lastSync.synced_count }}</p>
              <p class="metric-label">Products Synced</p>
            </div>
          </div>
          <div v-if="lastSync.error_msg" class="error-banner">
            <AlertCircle :size="16" stroke-width="2" />
            <span>{{ lastSync.error_msg }}</span>
          </div>
        </div>

        <div class="dashboard-card history-card">
          <div class="card-header">
            <h3 class="card-title">Sync History</h3>
          </div>

          <LoadingState v-if="loading" message="Loading sync logs..." />
          <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadSyncLogs" />

          <div v-else-if="syncLogs.length === 0" class="empty-history">
            <EmptyState
              :icon="History"
              title="No Sync History"
              message="You haven't synced any products yet. Click the button above to start syncing."
            />
          </div>

          <div v-else class="history-list">
            <div v-for="log in syncLogs" :key="log.id" class="history-item">
              <div class="history-icon" :class="log.status === 'success' ? 'success' : 'error'">
                <CheckCircle2 v-if="log.status === 'success'" :size="18" stroke-width="2" />
                <XCircle v-else :size="18" stroke-width="2" />
              </div>
              <div class="history-details">
                <p class="history-status">{{ log.status === 'success' ? 'Sync Successful' : 'Sync Failed' }}</p>
                <p class="history-time">{{ formatDate(log.created_at) }}</p>
              </div>
              <div class="history-badge" :class="log.status === 'success' ? 'badge-success' : 'badge-error'">
                {{ log.synced_count }} products
              </div>
            </div>

            <div v-if="totalPages > 1" class="pagination">
              <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
                <ChevronLeft :size="16" stroke-width="2" />
                <span>Previous</span>
              </button>
              <span class="pagination-info">Page <b>{{ currentPage }}</b> of {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
                <span>Next</span>
                <ChevronRight :size="16" stroke-width="2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification :show="toast.show" :type="toast.type" :message="toast.message" @close="toast.show = false" :duration="3000" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCw, CheckCircle2, XCircle, Loader2, History, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'
import ToastNotification from '../components/ToastNotification.vue'

const loading = ref(false)
const syncing = ref(false)
const error = ref('')
const syncLogs = ref<any[]>([])
const lastSync = ref<any>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const toast = ref({ show: false, type: 'info' as any, message: '' })

const loadSyncLogs = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await xshop.getSyncLogs(currentPage.value, 10)
    if (res.data?.status === 'success') {
      const output = res.data.output
      if (Array.isArray(output)) {
        syncLogs.value = output
        totalPages.value = 1
      } else {
        syncLogs.value = output.items || []
        totalPages.value = Math.ceil((output.total || 0) / 10)
      }
      if (syncLogs.value.length > 0) {
        lastSync.value = syncLogs.value[0]
      }
    }
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to load sync logs'
  } finally {
    loading.value = false
  }
}

const syncNow = async () => {
  syncing.value = true
  try {
    const res = await xshop.syncProducts()
    if (res.data?.status === 'success') {
      const syncedCount = (res.data.output.created || 0) + (res.data.output.updated || 0) || res.data.output.received || 0
      toast.value = { show: true, type: 'success', message: `Synced ${syncedCount} products successfully` }
      loadSyncLogs()
    }
  } catch (e: any) {
    toast.value = { show: true, type: 'error', message: e.response?.data?.detail || 'Failed to sync products' }
  } finally {
    syncing.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadSyncLogs()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadSyncLogs()
  }
}

onMounted(() => loadSyncLogs())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-container {
  min-height: 100vh;
  background: #fcfcfd;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

/* Header Styling */
.header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #f1f5f9;
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Sync Action Banner */
.sync-banner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
  gap: 20px;
}

.banner-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.banner-icon {
  width: 52px;
  height: 52px;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #f1f5f9;
}

.banner-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}

.banner-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
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
  white-space: nowrap;
}

.sync-btn:hover:not(:disabled) {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.sync-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Common Dashboard Cards */
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #fcfcfd;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

/* Last Sync Status Card */
.status-content {
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon-wrapper.success {
  background: #ecfdf5;
  color: #059669;
}

.status-icon-wrapper.error {
  background: #fef2f2;
  color: #dc2626;
}

.status-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.status-time {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.status-metrics {
  text-align: right;
  padding-right: 16px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
  border-top: 1px solid #fee2e2;
  font-weight: 500;
}

/* Sync History Card */
.empty-history {
  padding: 40px 24px;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: #f8fafc;
}

.history-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon.success {
  background: #ecfdf5;
  color: #059669;
}

.history-icon.error {
  background: #fef2f2;
  color: #dc2626;
}

.history-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-status {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.history-time {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.history-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.badge-success {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.badge-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fcfcfd;
  border-top: 1px solid #e2e8f0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pagination-btn:disabled {
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination-info {
  font-size: 13px;
  color: #64748b;
}

.pagination-info b {
  color: #0f172a;
  font-weight: 600;
}
</style>