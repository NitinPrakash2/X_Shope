<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">Manage customer orders</p>
        </div>
        <button @click="loadOrders" :disabled="loading" class="refresh-btn">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="18" />
          Refresh
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
        <div class="orders-table">
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
                  <span class="order-id">{{ order.id.substring(0, 8) }}...</span>
                </td>
                <td>
                  <div class="customer-cell">
                    <p class="customer-name">{{ order.customer_name || 'N/A' }}</p>
                    <p class="customer-email">{{ order.customer_email || 'N/A' }}</p>
                  </div>
                </td>
                <td>
                  <span class="product-id">{{ order.product_id ? order.product_id.substring(0, 8) + '...' : 'N/A' }}</span>
                </td>
                <td>
                  <span class="amount">{{ formatAmount(order.amount) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(order.status)]">
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

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <ChevronLeft :size="18" />
            Previous
          </button>
          <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }} ({{ totalOrders }} total)</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next
            <ChevronRight :size="18" />
          </button>
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

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const getStatusClass = (status: string) => {
  switch (status) {
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

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.orders-table {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background: #f9fafb;
}

td {
  padding: 16px 20px;
  font-size: 14px;
}

.order-id {
  font-family: monospace;
  color: #111827;
  font-weight: 500;
}

.customer-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.customer-email {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.product-id {
  color: #6b7280;
}

.amount {
  font-weight: 600;
  color: #111827;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-default {
  background: #f3f4f6;
  color: #6b7280;
}

.date {
  color: #6b7280;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
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
