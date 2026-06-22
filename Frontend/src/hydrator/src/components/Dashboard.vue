<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's your store overview.</p>
        </div>
        <button @click="refresh" class="refresh-btn" :disabled="loading">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="18" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <LoadingState v-if="loading" message="Loading dashboard..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadDashboard" />

      <div v-else class="dashboard-grid">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #eef2ff; color: #4f46e5;">
              <Package :size="24" stroke-width="1.5" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Products</p>
              <p class="stat-value">{{ dashboard.total_products }}</p>
              <div class="stat-footer">
                <span class="stat-change positive">+12%</span>
                <span class="stat-context">from last month</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #f0fdf4; color: #16a34a;">
              <FileText :size="24" stroke-width="1.5" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Published Posts</p>
              <p class="stat-value">{{ dashboard.published_posts }}</p>
              <div class="stat-footer">
                <span class="stat-change positive">+8%</span>
                <span class="stat-context">from last month</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
              <Clock :size="24" stroke-width="1.5" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Scheduled Posts</p>
              <p class="stat-value">{{ dashboard.scheduled_posts }}</p>
              <div class="stat-footer">
                <span class="stat-change neutral">{{ dashboard.scheduled_posts }} pending</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
              <AlertCircle :size="24" stroke-width="1.5" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Failed Posts</p>
              <p class="stat-value">{{ dashboard.failed_posts }}</p>
              <div class="stat-footer">
                <span class="stat-change negative" v-if="dashboard.failed_posts > 0">Needs attention</span>
                <span class="stat-change positive" v-else>All good</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #f3e8ff; color: #9333ea;">
              <ShoppingCart :size="24" stroke-width="1.5" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Orders</p>
              <p class="stat-value">{{ dashboard.total_orders }}</p>
              <div class="stat-footer">
                <span class="stat-change positive">+24%</span>
                <span class="stat-context">from last month</span>
              </div>
            </div>
          </div>

          <div class="stat-card clickable" @click="navigateTo('/xshop/x-account')">
            <div class="stat-icon" style="background: #eff6ff; color: #3b82f6;">
              <Twitter :size="24" stroke-width="1.5" />
            </div>
            <div class="stat-content">
              <p class="stat-label">X Account</p>
              <p class="stat-value" :style="dashboard.x_account?.is_connected ? 'color: #111827;' : ''">
                {{ dashboard.x_account?.is_connected ? 'Connected' : 'Not Connected' }}
              </p>
              <div class="stat-footer">
                <span :class="['stat-change', dashboard.x_account?.is_connected ? 'positive' : 'negative']">
                  {{ dashboard.x_account?.is_connected ? ('@' + dashboard.x_account.username) : 'Connect now →' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Section -->
        <div v-if="analytics" class="analytics-section">
          <h2 class="section-title">Analytics Overview</h2>
          <div class="analytics-card">
            <div class="analytics-grid">
              <div class="analytics-item">
                <div class="analytics-icon" style="background: #eef2ff; color: #4f46e5;">
                  <Eye :size="20" stroke-width="1.5" />
                </div>
                <div class="analytics-info">
                  <p class="analytics-label">Total Views</p>
                  <p class="analytics-value">{{ formatNumber(analytics.total_views || 0) }}</p>
                </div>
              </div>
              
              <div class="divider"></div>

              <div class="analytics-item">
                <div class="analytics-icon" style="background: #f0fdf4; color: #16a34a;">
                  <MousePointer :size="20" stroke-width="1.5" />
                </div>
                <div class="analytics-info">
                  <p class="analytics-label">Total Clicks</p>
                  <p class="analytics-value">{{ formatNumber(analytics.total_clicks || 0) }}</p>
                </div>
              </div>

              <div class="divider"></div>

              <div class="analytics-item">
                <div class="analytics-icon" style="background: #fef3c7; color: #d97706;">
                  <TrendingUp :size="20" stroke-width="1.5" />
                </div>
                <div class="analytics-info">
                  <p class="analytics-label">Conversion Rate</p>
                  <p class="analytics-value">{{ analytics.conversion_rate || 0 }}%</p>
                </div>
              </div>
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
import { Package, FileText, Clock, AlertCircle, ShoppingCart, Twitter, RefreshCw, Eye, MousePointer, TrendingUp } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import ToastNotification from '../components/ToastNotification.vue'

const loading = ref(false)
const error = ref('')
const dashboard = ref({
  total_products: 0,
  published_posts: 0,
  scheduled_posts: 0,
  failed_posts: 0,
  total_orders: 0,
  x_account_connected: false,
  x_account: {
    is_connected: false,
    username: ''
  }
})
const analytics = ref<any>(null)
const toast = ref({ show: false, type: 'info' as any, message: '' })

const loadDashboard = async () => {
  loading.value = true
  error.value = ''
  try {
    const [dashRes, analyticsRes] = await Promise.all([
      xshop.getDashboard(),
      xshop.getAnalytics()
    ])
    
    if (dashRes.data?.status === 'success') {
      dashboard.value = dashRes.data.output
    }
    if (analyticsRes.data?.status === 'success') {
      analytics.value = analyticsRes.data.output
    }
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  if (!loading.value) {
    loadDashboard()
    toast.value = { show: true, type: 'info', message: 'Refreshing dashboard...' }
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const navigateTo = (path: string) => {
  const nav = (window as any).xshopNavigate
  if (nav) nav(path)
}

onMounted(() => loadDashboard())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.dashboard-container {
  min-height: 100vh;
  background: #fcfcfd;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #111827;
}

/* Header Styling */
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Primary Button */
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
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

.refresh-btn:hover:not(:disabled) {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 32px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* Premium Card Design */
.stat-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.01);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  transform: translateY(-3px);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 0 0 2px transparent;
  transition: box-shadow 0.2s ease;
  pointer-events: none;
}

.stat-card.clickable:active::after {
  box-shadow: 0 0 0 2px #3b82f6;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 6px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.stat-context {
  color: #94a3b8;
  font-weight: 400;
}

.stat-change.positive {
  color: #059669;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 12px;
}

.stat-change.negative {
  color: #e11d48;
  background: #fff1f2;
  padding: 2px 8px;
  border-radius: 12px;
}

.stat-change.neutral {
  color: #d97706;
  background: #fffbeb;
  padding: 2px 8px;
  border-radius: 12px;
}

/* Analytics Section */
.analytics-section {
  margin-top: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px 0;
  letter-spacing: -0.01em;
}

.analytics-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.analytics-card:hover {
  box-shadow: 0 8px 16px -6px rgba(0, 0, 0, 0.04);
}

.analytics-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}

.analytics-item {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 200px;
}

.analytics-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.analytics-info {
  display: flex;
  flex-direction: column;
}

.analytics-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.analytics-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.divider {
  width: 1px;
  height: 40px;
  background-color: #e2e8f0;
}

/* Responsive Fixes */
@media (max-width: 768px) {
  .analytics-grid {
    flex-direction: column;
    align-items: flex-start;
  }
  .divider {
    width: 100%;
    height: 1px;
  }
}
</style>