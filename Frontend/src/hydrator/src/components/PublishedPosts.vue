<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Published Posts</h1>
          <p class="page-subtitle">Products published to your X account</p>
        </div>
        <button @click="loadPosts" :disabled="loading" class="refresh-btn">
          <RefreshCw :class="{ 'animate-spin': loading }" :size="16" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <LoadingState v-if="loading" message="Loading published posts..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadPosts" />

      <div v-else-if="posts.length === 0" class="empty-wrap">
        <EmptyState
          :icon="Twitter"
          title="No Posts Published Yet"
          message="Publish a product from the Products page to see it here."
          buttonText="Go to Products"
          @action="navigateTo('/xshop/products')"
        />
      </div>

      <div v-else class="posts-list">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <div class="post-avatar">
              <Twitter :size="18" />
            </div>
            <div class="post-meta">
              <p class="post-user">X Shop</p>
              <p class="post-time">{{ formatDate(post.published_at) }}</p>
            </div>
            <a v-if="post.x_post_id" :href="`https://x.com/i/web/status/${post.x_post_id}`" target="_blank" class="post-link">
              <ExternalLink :size="16" />
            </a>
          </div>
          <div class="post-body">
            <p class="post-text">{{ post.tweet_text }}</p>
          </div>
          <div class="post-footer">
            <span class="post-id">Post ID: {{ post.x_post_id || '—' }}</span>
            <span class="post-prod">Product: {{ post.product_id?.substring(0,8) || '—' }}</span>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination-wrap">
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
              <ChevronLeft :size="16" />
              <span>Previous</span>
            </button>
            <span class="page-info">Page <b>{{ currentPage }}</b> of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
              <span>Next</span>
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Twitter, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import EmptyState from './EmptyState.vue'

const loading = ref(false)
const error = ref('')
const posts = ref<any[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

const loadPosts = async () => {
  loading.value = true
  error.value = ''
  console.log('[PublishedPosts] loadPosts called, getPublishedPosts type:', typeof xshop?.getPublishedPosts)
  try {
    const res = await xshop.getPublishedPosts(currentPage.value, 20)
    console.log('[PublishedPosts] API response:', res.data)
    if (res.data?.status === 'success') {
      posts.value = res.data.output || []
      totalPages.value = Math.ceil((posts.value.length || 0) / 20) || 1
    } else {
      error.value = 'API returned: ' + JSON.stringify(res.data)
    }
  } catch (e: any) {
    console.error('[PublishedPosts] Error:', e)
    error.value = e.response?.data?.detail || e.message || 'Failed to load published posts'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

const navigateTo = (path: string) => {
  const nav = (window as any).xshopNavigate
  if (nav) nav(path)
}

const prevPage = () => {
  if (currentPage.value > 1) { currentPage.value--; loadPosts() }
}
const nextPage = () => {
  currentPage.value++; loadPosts()
}

onMounted(() => loadPosts())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-container { min-height: 100vh; background: #f8f9fc; font-family: 'Inter', sans-serif; color: #0b1a33; }
.header { background: rgba(255,255,255,.82); backdrop-filter: blur(14px); border-bottom: 1px solid #edf0f5; padding: 22px 36px; position: sticky; top: 0; z-index: 20; }
.header-content { max-width: 900px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 22px; font-weight: 700; color: #0b1a33; margin: 0 0 4px; letter-spacing: -.01em; }
.page-subtitle { font-size: 13px; color: #6b7a99; margin: 0; }
.refresh-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #0b1a33; color: #fff; border: none; border-radius: 10px; font-weight: 500; font-size: 13px; font-family: inherit; cursor: pointer; transition: all .2s; }
.refresh-btn:hover { background: #1a2d4a; transform: translateY(-1px); }
.refresh-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.content-wrapper { max-width: 900px; margin: 0 auto; padding: 32px; }
.empty-wrap { padding: 60px 0; }

.posts-list { display: flex; flex-direction: column; gap: 16px; }

.post-card {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02), 0 4px 12px -4px rgba(0,0,0,.04);
  transition: all .2s;
}
.post-card:hover { border-color: #dde2ec; box-shadow: 0 8px 24px -8px rgba(0,0,0,.06); transform: translateY(-2px); }

.post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.post-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.post-meta { flex: 1; }
.post-user { font-size: 14px; font-weight: 600; color: #0b1a33; margin: 0 0 2px; }
.post-time { font-size: 12px; color: #6b7a99; margin: 0; }
.post-link { color: #6b7a99; transition: color .2s; }
.post-link:hover { color: #1d9bf0; }

.post-body { background: #f8f9fc; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.post-text { font-size: 14px; color: #1a2d4a; line-height: 1.6; margin: 0; white-space: pre-wrap; word-break: break-word; }

.post-footer { display: flex; gap: 20px; font-size: 12px; color: #6b7a99; }
.post-id { font-family: 'SF Mono', monospace; }
.post-prod { font-family: 'SF Mono', monospace; }

.pagination-wrap { display: flex; justify-content: center; margin-top: 24px; }
.pagination { display: inline-flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #edf0f5; border-radius: 12px; padding: 8px; }
.page-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px; background: transparent; font-size: 13px; font-weight: 500; color: #0b1a33; font-family: inherit; cursor: pointer; transition: all .2s; }
.page-btn:hover:not(:disabled) { background: #f8f9fc; }
.page-btn:disabled { color: #b0bedb; cursor: not-allowed; }
.page-info { font-size: 13px; color: #6b7a99; }
</style>
