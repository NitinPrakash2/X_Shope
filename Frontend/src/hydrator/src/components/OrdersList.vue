<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">Manage customer orders and transactions.</p>
        </div>
        <button @click="loadOrders" :disabled="loading" class="refresh-btn">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="16" stroke-width="2" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <LoadingState v-if="loading" message="Loading orders..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadOrders" />

      <div v-else-if="orders.length === 0">
        <EmptyState
          :icon="ShoppingCart"
          title="No Orders Yet"
          message="You don't have any orders. Orders will appear here when customers purchase your products."
        />
      </div>

      <div v-else class="orders-container">
        <!-- Modern Table -->
        <div class="table-card">
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id" class="order-row">
                  <td>
                    <span class="mono-badge">{{ order.id.substring(0, 8) }}...</span>
                  </td>
                  <td>
                    <div class="customer-cell">
                      <p class="customer-name">{{ order.customer_name || 'Anonymous User' }}</p>
                      <p class="customer-email">{{ order.customer_email || 'No email provided' }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="mono-text" title="Product ID">
                      {{ order.product_id ? order.product_id.substring(0, 8) + '...' : 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <span class="amount">{{ formatAmount(order.amount) }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', getStatusClass(order.status)]">
                      <span class="status-dot"></span>
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <span class="date">{{ formatDate(order.created_at) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-wrapper">
          <div class="pagination">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              <ChevronLeft :size="16" stroke-width="2" />
              <span>Previous</span>
            </button>
            <span class="pagination-info">Page <b>{{ currentPage }}</b> of {{ totalPages }} <span class="text-muted">({{ totalOrders }} total)</span></span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              <span>Next</span>
              <ChevronRight :size="16" stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShoppingCart, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const loading = ref(false)
const error = ref('')
const orders = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalOrders = ref(0)

const loadOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await xshop.getOrders(currentPage.value, 20)
    if (res.data?.status === 'success') {
      orders.value = res.data.output.items || []
      totalOrders.value = res.data.output.total || 0
      totalPages.value = Math.ceil(totalOrders.value / 20)
    }
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

const formatAmount = (amount: number | null) => {
  if (!amount) return 'N/A'
  return `$${amount.toFixed(2)}`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'status-completed'
    case 'confirmed': return 'status-confirmed'
    case 'pending': return 'status-pending'
    case 'cancelled': return 'status-cancelled'
    default: return 'status-default'
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadOrders()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadOrders()
  }
}

onMounted(() => loadOrders())
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
  padding: 32px;
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Table Card */
.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

th {
  padding: 14px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background: #f8fafc;
}

td {
  padding: 16px 24px;
  font-size: 14px;
  vertical-align: middle;
}

/* Typography & Cells */
.mono-badge {
  font-family: 'ui-monospace', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.mono-text {
  font-family: 'ui-monospace', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #64748b;
}

.customer-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  font-size: 14px;
}

.customer-email {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.amount {
  font-weight: 600;
  color: #0f172a;
}

.date {
  color: #64748b;
  font-size: 14px;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.01em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-completed {
  background: #ecfdf5;
  color: #059669;
}
.status-completed .status-dot { background: #10b981; }

.status-confirmed {
  background: #eff6ff;
  color: #1d4ed8;
}
.status-confirmed .status-dot { background: #3b82f6; }

.status-pending {
  background: #fffbeb;
  color: #d97706;
}
.status-pending .status-dot { background: #f59e0b; }

.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
}
.status-cancelled .status-dot { background: #ef4444; }

.status-default {
  background: #f1f5f9;
  color: #64748b;
}
.status-default .status-dot { background: #94a3b8; }

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.pagination {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.pagination-btn:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #475569;
  padding: 0 8px;
}

.text-muted {
  color: #94a3b8;
  font-weight: 400;
}
</style>