<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Product Sync</h1>
          <p class="page-subtitle">Sync products from external API</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Sync Action Card -->
      <div class="sync-card">
        <div class="sync-header">
          <div class="sync-icon">
            <RefreshCw :size="28" />
          </div>
          <div>
            <h2 class="sync-title">Sync Products Now</h2>
            <p class="sync-description">Fetch the latest products from your external product API and update your inventory.</p>
          </div>
        </div>
        <button @click="syncNow" :disabled="syncing" class="sync-btn">
          <Loader2 v-if="syncing" :size="20" class="animate-spin" />
          <RefreshCw v-else :size="20" />
          {{ syncing ? 'Syncing...' : 'Sync Products' }}
        </button>
      </div>

      <!-- Last Sync Status -->
      <div v-if="lastSync" class="status-card">
        <div class="status-header">
          <h3 class="status-title">Last Sync Status</h3>
        </div>
        <div class="status-content">
          <div class="status-info">
            <div class="status-icon-wrapper" :class="lastSync.status === 'success' ? 'success' : 'error'">
              <CheckCircle2 v-if="lastSync.status === 'success'" :size="24" />
              <XCircle v-else :size="24" />
            </div>
            <div>
              <p class="status-label">{{ lastSync.status === 'success' ? 'Successful' : 'Failed' }}</p>
              <p class="status-time">{{ formatDate(lastSync.created_at) }}</p>
            </div>
          </div>
          <div class="status-count">
            <p class="count-value">{{ lastSync.synced_count }}</p>
            <p class="count-label">Products Synced</p>
          </div>
        </div>
        <div v-if="lastSync.error_msg" class="error-banner">
          <AlertCircle :size="16" />
          {{ lastSync.error_msg }}
        </div>
      </div>

      <!-- Sync History -->
      <div class="history-card">
        <div class="history-header">
          <h3 class="history-title">Sync History</h3>
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
              <CheckCircle2 v-if="log.status === 'success'" :size="20" />
              <XCircle v-else :size="20" />
            </div>
            <div class="history-details">
              <p class="history-status">{{ log.status === 'success' ? 'Sync Successful' : 'Sync Failed' }}</p>
              <p class="history-time">{{ formatDate(log.created_at) }}</p>
            </div>
            <div class="history-badge" :class="log.status === 'success' ? 'badge-success' : 'badge-error'">
              {{ log.synced_count }} products
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
              <ChevronLeft :size="18" />
              Previous
            </button>
            <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
              Next
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification :show="toast.show" :type="toast.type" :message="toast.message" @close="toast.show = false" :duration="3000" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
      syncLogs.value = res.data.output.items || []
      totalPages.value = Math.ceil((res.data.output.total || 0) / 10)
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
      toast.value = { show: true, type: 'success', message: `Synced ${res.data.output.synced || 0} products successfully` }
      loadSyncLogs()
    }
  } catch (e: any) {
    toast.value = { show: true, type: 'error', message: e.response?.data?.detail || 'Failed to sync products' }
  } finally {
    syncing.value = false
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString()

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
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sync-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.sync-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.sync-icon {
  width: 56px;
  height: 56px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sync-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px 0;
}

.sync-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.sync-btn:hover:not(:disabled) {
  background: #4338ca;
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.status-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-content {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon-wrapper.success {
  background: #d1fae5;
  color: #065f46;
}

.status-icon-wrapper.error {
  background: #fee2e2;
  color: #991b1b;
}

.status-label {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.status-time {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.status-count {
  text-align: right;
}

.count-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.count-label {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 13px;
  border-top: 1px solid #fecaca;
}

.history-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.history-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.empty-history {
  padding: 24px;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: #f9fafb;
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon.success {
  background: #d1fae5;
  color: #065f46;
}

.history-icon.error {
  background: #fee2e2;
  color: #991b1b;
}

.history-details {
  flex: 1;
}

.history-status {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
}

.history-time {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.history-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}
</style>
