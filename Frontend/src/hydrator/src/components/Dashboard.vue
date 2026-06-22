<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's your store overview</p>
        </div>
        <button @click="refresh" class="refresh-btn" :disabled="loading">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="18" />
          Refresh
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
              <Package :size="24" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Products</p>
              <p class="stat-value">{{ dashboard.total_products }}</p>
              <p class="stat-change positive">+12% from last month</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #f0fdf4; color: #16a34a;">
              <FileText :size="24" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Published Posts</p>
              <p class="stat-value">{{ dashboard.published_posts }}</p>
              <p class="stat-change positive">+8% from last month</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
              <Clock :size="24" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Scheduled Posts</p>
              <p class="stat-value">{{ dashboard.scheduled_posts }}</p>
              <p class="stat-change">{{ dashboard.scheduled_posts }} pending</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
              <AlertCircle :size="24" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Failed Posts</p>
              <p class="stat-value">{{ dashboard.failed_posts }}</p>
              <p class="stat-change negative" v-if="dashboard.failed_posts > 0">Needs attention</p>
              <p class="stat-change" v-else>All good</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #f3e8ff; color: #9333ea;">
              <ShoppingCart :size="24" />
            </div>
            <div class="stat-content">
              <p class="stat-label">Total Orders</p>
              <p class="stat-value">{{ dashboard.total_orders }}</p>
              <p class="stat-change positive">+24% from last month</p>
            </div>
          </div>

          <div class="stat-card" style="cursor:pointer" @click="navigateTo('/xshop/x-account')">
            <div class="stat-icon" style="background: #dbeafe; color: #2563eb;">
              <Twitter :size="24" />
            </div>
            <div class="stat-content">
              <p class="stat-label">X Account</p>
              <p class="stat-value" :style="dashboard.x_account?.is_connected ? 'color:#16a34a;font-size:18px' : ''">
                {{ dashboard.x_account?.is_connected ? 'Connected' : 'Not Connected' }}
              </p>
              <p :class="['stat-change', dashboard.x_account?.is_connected ? 'positive' : 'negative']">
                {{ dashboard.x_account?.is_connected ? ('@' + dashboard.x_account.username) : 'Connect now →' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Analytics Section -->
        <div v-if="analytics" class="analytics-card">
          <h2 class="section-title">Analytics Overview</h2>
          <div class="analytics-grid">
            <div class="analytics-item">
              <div class="analytics-icon" style="background: #eef2ff; color: #4f46e5;">
                <Eye :size="20" />
              </div>
              <div>
                <p class="analytics-label">Total Views</p>
                <p class="analytics-value">{{ formatNumber(analytics.total_views || 0) }}</p>
              </div>
            </div>
            <div class="analytics-item">
              <div class="analytics-icon" style="background: #f0fdf4; color: #16a34a;">
                <MousePointer :size="20" />
              </div>
              <div>
                <p class="analytics-label">Total Clicks</p>
                <p class="analytics-value">{{ formatNumber(analytics.total_clicks || 0) }}</p>
              </div>
            </div>
            <div class="analytics-item">
              <div class="analytics-icon" style="background: #fef3c7; color: #d97706;">
                <TrendingUp :size="20" />
              </div>
              <div>
                <p class="analytics-label">Conversion Rate</p>
                <p class="analytics-value">{{ analytics.conversion_rate || 0 }}%</p>
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
  x_account_connected: false
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
.dashboard-container {
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #4338ca;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
}

.stat-change {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.stat-change.positive {
  color: #16a34a;
}

.stat-change.negative {
  color: #dc2626;
}

.analytics-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.analytics-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.analytics-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.analytics-label {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.analytics-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
</style>
