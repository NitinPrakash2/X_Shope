<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Manage your product inventory.</p>
        </div>
        <button @click="loadProducts" :disabled="loading" class="refresh-btn">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="16" stroke-width="2" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Search & Filter -->
      <div class="filter-bar">
        <div class="search-box">
          <Search :size="18" class="search-icon" stroke-width="1.5" />
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            type="text"
            placeholder="Search products..."
            class="search-input"
          />
        </div>
        <div class="filter-select-wrapper">
          <select v-model="statusFilter" @change="loadProducts" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown :size="16" class="select-icon" stroke-width="1.5" />
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading products..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadProducts" />

      <div v-else-if="products.length === 0">
        <EmptyState
          :icon="Package"
          title="No Products Found"
          message="No products available. Try syncing products from your external API."
          buttonText="Go to Sync"
          @action="navigateToSync"
        />
      </div>

      <div v-else>
        <!-- Products Grid -->
        <div class="products-grid">
          <div
            v-for="product in products"
            :key="product.id"
            @click="viewProduct(product.id)"
            class="product-card"
          >
            <div class="product-image">
              <img v-if="product.images?.length" :src="product.images[0]" alt="Product" />
              <div v-else class="image-placeholder">
                <ImageIcon :size="28" stroke-width="1.5" />
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description || 'No description available' }}</p>
              
              <div class="product-meta">
                <span class="product-price">{{ formatPrice(product.price) }}</span>
                <span
                  :class="['product-badge', product.status === 'active' ? 'badge-success' : 'badge-gray']"
                >
                  {{ product.status }}
                </span>
              </div>
              
              <div class="product-footer">
                <div class="product-stock">
                  <Package :size="14" stroke-width="1.5" />
                  <span>Stock: {{ product.stock || 0 }}</span>
                </div>
              </div>
            </div>
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
            <span class="pagination-info">Page <b>{{ currentPage }}</b> of {{ totalPages }} <span class="text-muted">({{ totalProducts }} total)</span></span>
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
import { Package, RefreshCw, ImageIcon, Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const loading = ref(false)
const error = ref('')
const products = ref<any[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalProducts = ref(0)
let searchTimeout: any = null

const loadProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await xshop.getProducts(currentPage.value, 20, searchQuery.value, statusFilter.value)
    if (res.data?.status === 'success') {
      products.value = res.data.output.items || []
      totalProducts.value = res.data.output.total || 0
      totalPages.value = Math.ceil(totalProducts.value / 20)
    }
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 500)
}

const formatPrice = (price: number | null) => {
  if (!price) return 'N/A'
  return `$${price.toFixed(2)}`
}

const viewProduct = (id: string) => {
  console.log('View product:', id)
}

const navigateToSync = () => {
  const navigate = (window as any).xshopNavigate
  if (navigate) navigate('/xshop/sync')
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadProducts()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadProducts()
  }
}

onMounted(() => loadProducts())
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

/* Search & Filter Bar */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
  color: #0f172a;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select-wrapper {
  position: relative;
  min-width: 160px;
}

.filter-select {
  width: 100%;
  padding: 10px 36px 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  appearance: none;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* Premium Card Styling */
.product-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  transform: translateY(-4px);
}

.product-image {
  width: 100%;
  height: 220px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #f1f5f9;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.image-placeholder {
  color: #cbd5e1;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  flex: 1;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.product-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.badge-success {
  background: #ecfdf5;
  color: #059669;
}

.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
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
}
</style>