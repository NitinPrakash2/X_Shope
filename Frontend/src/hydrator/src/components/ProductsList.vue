<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Manage your product inventory</p>
        </div>
        <button @click="loadProducts" :disabled="loading" class="refresh-btn">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="18" />
          Refresh
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Search & Filter -->
      <div class="filter-bar">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            type="text"
            placeholder="Search products..."
            class="search-input"
          />
        </div>
        <select v-model="statusFilter" @change="loadProducts" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
                <ImageIcon :size="32" />
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description || 'No description' }}</p>
              <div class="product-meta">
                <span class="product-price">{{ formatPrice(product.price) }}</span>
                <span
                  :class="['product-badge', product.status === 'active' ? 'badge-success' : 'badge-gray']"
                >
                  {{ product.status }}
                </span>
              </div>
              <div class="product-stock">
                <Package :size="16" />
                <span>Stock: {{ product.stock || 0 }}</span>
              </div>
            </div>
          </div>
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
          <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }} ({{ totalProducts }} total)</span>
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
import { Package, RefreshCw, ImageIcon, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
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

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.product-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: #9ca3af;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #4f46e5;
}

.product-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
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
